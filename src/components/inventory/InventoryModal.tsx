
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories, zones, suppliers } from '@/data/mockData';
import { Product } from '@/data/mockData';

interface InventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (productData: Omit<Product, 'id'> | Product) => void;
  mode: 'add' | 'edit';
}

const InventoryModal: React.FC<InventoryModalProps> = ({ open, onOpenChange, product, mode, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    reorder_point: 0,
    forecast_demand: 0,
    zone: '',
    supplier: '',
    last_replenished: new Date().toISOString().split('T')[0],
    reorder_recommendation: false,
    unit_cost: 0
  });

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name,
        category: product.category,
        stock: product.stock,
        reorder_point: product.reorder_point,
        forecast_demand: product.forecast_demand,
        zone: product.zone,
        supplier: product.supplier,
        last_replenished: product.last_replenished,
        reorder_recommendation: product.reorder_recommendation,
        unit_cost: product.unit_cost
      });
    } else {
      setFormData({
        name: '',
        category: '',
        stock: 0,
        reorder_point: 0,
        forecast_demand: 0,
        zone: '',
        supplier: '',
        last_replenished: new Date().toISOString().split('T')[0],
        reorder_recommendation: false,
        unit_cost: 0
      });
    }
  }, [product, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(cat => cat !== 'All').map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Level</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                value={formData.reorder_point}
                onChange={(e) => handleInputChange('reorder_point', parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="forecast_demand">Forecast Demand</Label>
              <Input
                id="forecast_demand"
                type="number"
                value={formData.forecast_demand}
                onChange={(e) => handleInputChange('forecast_demand', parseInt(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit_cost">Unit Cost ($)</Label>
              <Input
                id="unit_cost"
                type="number"
                step="0.01"
                value={formData.unit_cost}
                onChange={(e) => handleInputChange('unit_cost', parseFloat(e.target.value) || 0)}
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zone">Zone</Label>
            <Select value={formData.zone} onValueChange={(value) => handleInputChange('zone', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.filter(zone => zone !== 'All').map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="supplier">Supplier</Label>
            <Select value={formData.supplier} onValueChange={(value) => handleInputChange('supplier', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.filter(supplier => supplier !== 'All').map(supplier => (
                  <SelectItem key={supplier} value={supplier}>{supplier}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="last_replenished">Last Replenished</Label>
            <Input
              id="last_replenished"
              type="date"
              value={formData.last_replenished}
              onChange={(e) => handleInputChange('last_replenished', e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
