
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
import { Product } from "@/contexts/InventoryContext";

const categories = ["Electronics", "Machinery", "Safety Equipment", "Components", "Tools", "Hardware", "Materials"];
const zones = ["Zone A", "Zone B", "Zone C"];
const suppliers = ["HydroTech Solutions", "MetalWorks Inc", "SafeGuard Corp", "PowerTech Ltd", "SealPro Industries", "FlowControl Systems", "LightMetal Co", "ElectroSafe Inc", "ConnectPro Ltd"];

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'> | Product) => void;
  mode: 'add' | 'edit';
}

const InventoryModal = ({ open, onOpenChange, product, onSave, mode }: InventoryModalProps) => {
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    category: '',
    stock_level: 0,
    reorder_point: 0,
    forecast_demand: 0,
    zone: '',
    supplier: '',
    unit_cost: 0,
    demand_trend: 'stable',
    last_replenished: new Date().toISOString().split('T')[0],
    warehouse: ''
  });

  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        product_name: product.product_name,
        sku: product.sku,
        category: product.category,
        stock_level: product.stock_level,
        reorder_point: product.reorder_point,
        forecast_demand: product.forecast_demand,
        zone: product.zone,
        supplier: product.supplier,
        unit_cost: product.unit_cost,
        demand_trend: product.demand_trend,
        last_replenished: product.last_replenished,
        warehouse: product.warehouse
      });
    } else if (mode === 'add') {
      setFormData({
        product_name: '',
        sku: '',
        category: '',
        stock_level: 0,
        reorder_point: 0,
        forecast_demand: 0,
        zone: '',
        supplier: '',
        unit_cost: 0,
        demand_trend: 'stable',
        last_replenished: new Date().toISOString().split('T')[0],
        warehouse: ''
      });
    }
  }, [mode, product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.product_name || !formData.sku || !formData.category || !formData.zone || !formData.supplier) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (formData.stock_level < 0 || formData.reorder_point < 0 || formData.forecast_demand < 0 || formData.unit_cost < 0) {
      toast({
        title: "Validation Error",
        description: "Values cannot be negative.",
        variant: "destructive"
      });
      return;
    }

    const productData = {
      ...formData
    };

    if (mode === 'edit' && product) {
      onSave({ ...product, ...productData });
    } else {
      onSave(productData);
    }

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
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU"
                required
              />
            </div>
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
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_level">Current Stock</Label>
              <Input
                id="stock_level"
                type="number"
                min="0"
                value={formData.stock_level}
                onChange={(e) => setFormData({ ...formData, stock_level: parseInt(e.target.value) || 0 })}
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
                  {zones.map((zone) => (
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
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_cost">Unit Cost ($)</Label>
              <Input
                id="unit_cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="demand_trend">Demand Trend</Label>
              <Select 
                value={formData.demand_trend} 
                onValueChange={(value) => setFormData({ ...formData, demand_trend: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trend" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increasing">Increasing</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="decreasing">Decreasing</SelectItem>
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
