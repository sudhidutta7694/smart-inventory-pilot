import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupplyChainStore } from '@/stores/supplyChainStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import InventoryModal from '@/components/inventory/InventoryModal';
import DeleteConfirmDialog from '@/components/inventory/DeleteConfirmDialog';
import { ChevronUp, ChevronDown, Search, Plus, Edit2, Trash2, Eye, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { zones, categories, suppliers, type Product } from '@/data/mockData';

const EnhancedInventoryTable = () => {
  const navigate = useNavigate();
  const { 
    products, 
    isLoading, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    activeWarehouse 
  } = useSupplyChainStore();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = selectedZone === 'All' || product.zone === selectedZone;
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSupplier = selectedSupplier === 'All' || product.supplier === selectedSupplier;
      
      return matchesSearch && matchesZone && matchesCategory && matchesSupplier;
    });

    // Sort products
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      return 0;
    });

    return filtered;
  }, [products, searchTerm, selectedZone, selectedCategory, selectedSupplier, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Stock status helper
  const getStockStatus = (product: Product) => {
    if (product.stock <= product.reorder_point * 0.5) {
      return { status: 'Critical', color: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> };
    } else if (product.stock <= product.reorder_point) {
      return { status: 'Low', color: 'warning', icon: <Package className="h-3 w-3" /> };
    } else if (product.stock > product.forecast_demand * 2) {
      return { status: 'Overstock', color: 'secondary', icon: <TrendingUp className="h-3 w-3" /> };
    } else {
      return { status: 'Good', color: 'default', icon: <Package className="h-3 w-3" /> };
    }
  };

  // Demand trend helper
  const getDemandTrend = (current: number, forecast: number) => {
    const ratio = forecast / current;
    if (ratio > 1.5) return { trend: 'High', color: 'destructive' };
    if (ratio > 1.2) return { trend: 'Rising', color: 'warning' };
    if (ratio < 0.8) return { trend: 'Falling', color: 'secondary' };
    return { trend: 'Stable', color: 'default' };
  };

  // Event handlers
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleViewMore = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
    if (modalMode === 'add') {
      addProduct(productData as Omit<Product, 'id'>);
      toast({
        title: "Product Added",
        description: `${productData.name} has been added successfully.`,
      });
    } else {
      updateProduct(selectedProduct!.id, productData);
      toast({
        title: "Product Updated",
        description: `${productData.name} has been updated successfully.`,
      });
    }
    setModalOpen(false);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  // Sort button component
  const SortButton = ({ field, children }: { field: keyof Product; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-1 font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? 
        <ChevronUp className="ml-1 h-3 w-3" /> : 
        <ChevronDown className="ml-1 h-3 w-3" />
      )}
    </Button>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            Inventory Management
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredAndSortedProducts.length} items)
            </span>
          </CardTitle>
          <Button onClick={handleAddProduct} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortButton field="name">Product</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="category">Category</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="zone">Zone</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="stock">Stock</SortButton>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <SortButton field="forecast_demand">Demand</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="unit_cost">Unit Cost</SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="last_replenished">Last Replenished</SortButton>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredAndSortedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="flex flex-col items-center space-y-2">
                          <Package className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No products found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAndSortedProducts.map((product, index) => {
                      const stockStatus = getStockStatus(product);
                      const demandTrend = getDemandTrend(product.stock, product.forecast_demand);
                      
                      return (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-muted/50"
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.zone}</TableCell>
                          <TableCell>
                            <div className="font-medium">{product.stock}</div>
                            <div className="text-xs text-muted-foreground">
                              Reorder: {product.reorder_point}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.color as any} className="flex items-center gap-1 w-fit">
                              {stockStatus.icon}
                              {stockStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{product.forecast_demand}</div>
                            <Badge variant={demandTrend.color as any} className="text-xs">
                              {demandTrend.trend}
                            </Badge>
                          </TableCell>
                          <TableCell>${product.unit_cost.toFixed(2)}</TableCell>
                          <TableCell>{new Date(product.last_replenished).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewMore(product.id)}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                                title="Edit Product"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product)}
                                title="Delete Product"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <InventoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
        mode={modalMode}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        product={productToDelete}
      />
    </motion.div>
  );
};

export default EnhancedInventoryTable;