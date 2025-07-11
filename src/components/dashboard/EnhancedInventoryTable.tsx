
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  TrendingUp,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSupplyChainStore } from "@/stores/supplyChainStore";
import { categories, zones, suppliers } from "@/data/mockData";
import InventoryModal from "@/components/inventory/InventoryModal";
import DeleteConfirmDialog from "@/components/inventory/DeleteConfirmDialog";
import { toast } from "@/hooks/use-toast";

const EnhancedInventoryTable = () => {
  const navigate = useNavigate();
  const { products, updateProduct, addProduct, deleteProduct } = useSupplyChainStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [zoneFilter, setZoneFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'forecast' | 'zone'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesZone = zoneFilter === 'All' || product.zone === zoneFilter;
      const matchesSupplier = supplierFilter === 'All' || product.supplier === supplierFilter;
      
      return matchesSearch && matchesCategory && matchesZone && matchesSupplier;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'forecast':
          aValue = a.forecast_demand;
          bValue = b.forecast_demand;
          break;
        case 'zone':
          aValue = a.zone;
          bValue = b.zone;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, zoneFilter, supplierFilter, sortBy, sortOrder]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been removed from inventory.`,
      });
      setProductToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSaveProduct = (productData: any) => {
    if (modalMode === 'edit' && selectedProduct) {
      updateProduct({ ...selectedProduct, ...productData });
    } else {
      addProduct(productData);
    }
  };

  const getStockStatus = (product: any) => {
    if (product.stock === 0) {
      return { status: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    } else if (product.stock <= product.reorder_point) {
      return { status: 'Low Stock', color: 'secondary', icon: AlertTriangle };
    } else if (product.stock > product.forecast_demand * 2) {
      return { status: 'Overstock', color: 'outline', icon: TrendingUp };
    }
    return { status: 'In Stock', color: 'default', icon: Package };
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Inventory Management</span>
              <Badge variant="outline" className="ml-2">
                {filteredAndSortedProducts.length} items
              </Badge>
            </CardTitle>
            <Button onClick={handleAddProduct} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Button>
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={zoneFilter} onValueChange={setZoneFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
                setZoneFilter("All");
                setSupplierFilter("All");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    Product {getSortIcon('name')}
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('stock')}
                  >
                    Stock {getSortIcon('stock')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('forecast')}
                  >
                    7-Day Forecast {getSortIcon('forecast')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('zone')}
                  >
                    Zone {getSortIcon('zone')}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredAndSortedProducts.map((product, index) => {
                    const stockStatus = getStockStatus(product);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.id}</div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div className="font-semibold">{product.stock}</div>
                          <div className="text-xs text-muted-foreground">
                            Reorder: {product.reorder_point}
                          </div>
                        </TableCell>
                        <TableCell>{product.forecast_demand}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.zone}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.color as any} className="flex items-center space-x-1 w-fit">
                            <StatusIcon className="h-3 w-3" />
                            <span>{stockStatus.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{product.supplier}</TableCell>
                        <TableCell>${product.unit_cost.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/products/${product.id}`)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
          
          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'All' || zoneFilter !== 'All' || supplierFilter !== 'All' 
                  ? "Try adjusting your search criteria" 
                  : "Start by adding your first product"}
              </p>
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <InventoryModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
        mode={modalMode}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        product={productToDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default EnhancedInventoryTable;
