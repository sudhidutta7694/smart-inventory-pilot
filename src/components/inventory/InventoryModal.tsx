
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { categories, zones, suppliers, type Product } from "@/data/mockData";

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  mode: 'add' | 'edit';
}

const InventoryModal = ({ open, onOpenChange, product, onSave, mode }: InventoryModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    reorder_point: 0,
    forecast_demand: 0,
    zone: '',
    supplier: '',
    last_replenished: new Date().toISOString().split('T')[0],
    reorder_recommendation: false
  });

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.name,
        category: product.category,
        stock: product.stock,
        reorder_point: product.reorder_point,
        forecast_demand: product.forecast_demand,
        zone: product.zone,
        supplier: product.supplier,
        last_replenished: product.last_replenished,
        reorder_recommendation: product.reorder_recommendation
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        category: '',
        stock: 0,
        reorder_point: 0,
        forecast_demand: 0,
        zone: '',
        supplier: '',
        last_replenished: new Date().toISOString().split('T')[0],
        reorder_recommendation: false
      });
    }
  }, [mode, product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.zone || !formData.supplier) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.stock < 0 || formData.reorder_point < 0 || formData.forecast_demand < 0) {
      toast({
        title: "Validation Error",
        description: "Stock values cannot be negative.",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...formData,
      reorder_recommendation: formData.stock <= formData.reorder_point
    };

    if (mode === 'edit' && product) {
      onSave({ ...product, ...productData });
    } else {
      onSave(productData);
    }

    toast({
      title: mode === 'add' ? "Product Added" : "Product Updated",
      description: `${formData.name} has been ${mode === 'add' ? 'added' : 'updated'} successfully.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Enter the details for the new product.' 
              : 'Update the product information below.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat !== 'All').map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Current Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                min="0"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="forecast_demand">7-Day Forecast</Label>
              <Input
                id="forecast_demand"
                type="number"
                min="0"
                value={formData.forecast_demand}
                onChange={(e) => setFormData({ ...formData, forecast_demand: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zone">Zone *</Label>
              <Select 
                value={formData.zone} 
                onValueChange={(value) => setFormData({ ...formData, zone: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.filter(zone => zone !== 'All').map((zone) => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select 
                value={formData.supplier} 
                onValueChange={(value) => setFormData({ ...formData, supplier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.filter(supplier => supplier !== 'All').map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_replenished">Last Replenished</Label>
            <Input
              id="last_replenished"
              type="date"
              value={formData.last_replenished}
              onChange={(e) => setFormData({ ...formData, last_replenished: e.target.value })}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Product' : 'Update Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
