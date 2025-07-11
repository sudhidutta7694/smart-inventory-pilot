import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { zones, categories, suppliers, type Product } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/contexts/InventoryContext";
import InventoryModal from "@/components/inventory/InventoryModal";
import DeleteConfirmDialog from "@/components/inventory/DeleteConfirmDialog";

const InventoryTable = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSupplier, setSelectedSupplier] = useState("All");
  const [sortField, setSortField] = useState<keyof Product>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesZone = selectedZone === "All" || product.zone === selectedZone;
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSupplier = selectedSupplier === "All" || product.supplier === selectedSupplier;
      
      return matchesSearch && matchesZone && matchesCategory && matchesSupplier;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedZone, selectedCategory, selectedSupplier, sortField, sortDirection]);

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleReorder = (productId: string, productName: string) => {
    toast({
      title: "Reorder Initiated",
      description: `Reorder process started for ${productName}`,
    });
  };

  const handleViewMore = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleAddProduct = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
    if (modalMode === 'add') {
      addProduct(productData as Omit<Product, 'id'>);
    } else {
      updateProduct(selectedProduct!.id, productData);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      toast({
        title: "Product Deleted",
        description: `${productToDelete.name} has been removed from inventory.`,
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getStockStatus = (product: Product) => {
    const stockLevel = (product.stock / product.reorder_point) * 100;
    
    if (stockLevel <= 75) {
      return { status: "Critical", color: "destructive", icon: <AlertTriangle className="h-3 w-3" /> };
    } else if (stockLevel <= 100) {
      return { status: "Low", color: "warning", icon: <TrendingDown className="h-3 w-3" /> };
    } else if (stockLevel <= 150) {
      return { status: "Normal", color: "success", icon: <CheckCircle className="h-3 w-3" /> };
    } else {
      return { status: "High", color: "secondary", icon: <TrendingUp className="h-3 w-3" /> };
    }
  };

  const getDemandTrend = (current: number, forecast: number) => {
    const ratio = forecast / current;
    if (ratio > 1.5) return { trend: "High Demand", color: "success" };
    if (ratio > 1.2) return { trend: "Increasing", color: "default" };
    if (ratio < 0.8) return { trend: "Decreasing", color: "warning" };
    return { trend: "Stable", color: "secondary" };
  };

  const SortButton = ({ field, children }: { field: keyof Product; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-medium"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </Button>
  );

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex items-center justify-center py-8">
          <p>Loading inventory...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Product Inventory</span>
              <Badge variant="outline" className="ml-2">
                {filteredAndSortedProducts.length} items
              </Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              <Button onClick={handleAddProduct} className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedZone !== "All" || selectedCategory !== "All" || selectedSupplier !== "All" || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedZone("All");
                  setSelectedCategory("All");
                  setSelectedSupplier("All");
                  setSearchTerm("");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead><SortButton field="name">Product</SortButton></TableHead>
                  <TableHead><SortButton field="category">Category</SortButton></TableHead>
                  <TableHead><SortButton field="stock">Stock Level</SortButton></TableHead>
                  <TableHead><SortButton field="forecast_demand">7-Day Forecast</SortButton></TableHead>
                  <TableHead>Demand Trend</TableHead>
                  <TableHead><SortButton field="zone">Zone</SortButton></TableHead>
                  <TableHead><SortButton field="last_replenished">Last Replenished</SortButton></TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.map((product, index) => {
                  const stockStatus = getStockStatus(product);
                  const demandTrend = getDemandTrend(product.stock, product.forecast_demand);
                  
                  return (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.id}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{product.stock}</span>
                          <Badge 
                            variant={stockStatus.color as any}
                            className="text-xs"
                          >
                            {stockStatus.icon}
                            <span className="ml-1">{stockStatus.status}</span>
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Reorder at: {product.reorder_point}
                        </p>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{product.forecast_demand}</p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min(100, (product.forecast_demand / Math.max(product.stock, product.forecast_demand)) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={demandTrend.color as any}
                          className="text-xs"
                        >
                          {demandTrend.trend}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">{product.zone}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <p className="text-sm">{new Date(product.last_replenished).toLocaleDateString()}</p>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMore(product.id)}
                            className="h-8 px-2 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="h-8 px-2 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className="h-8 px-2 text-xs hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                          
                          {product.reorder_recommendation && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReorder(product.id, product.name)}
                              className="h-8 px-2 text-xs"
                            >
                              Reorder
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found matching your filters</p>
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
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={productToDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default InventoryTable;
