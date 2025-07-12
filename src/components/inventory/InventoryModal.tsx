import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useForm, Controller } from "react-hook-form"
import { Product } from "@/data/mockData";
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

interface InventoryModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  stock: z.number().min(0, {
    message: "Stock must be a positive number.",
  }),
  forecast_demand: z.number().min(0, {
    message: "Forecast demand must be a positive number.",
  }),
  reorder_point: z.number().min(0, {
    message: "Reorder point must be a positive number.",
  }),
  supplier: z.string().min(2, {
    message: "Supplier must be at least 2 characters.",
  }),
  unit_cost: z.number().min(0, {
    message: "Unit cost must be a positive number.",
  }),
});

type FormData = z.infer<typeof formSchema>

const InventoryModal = ({ product, isOpen, onClose, onSave }: InventoryModalProps) => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      category: product.category,
      stock: product.stock,
      forecast_demand: product.forecast_demand,
      reorder_point: product.reorder_point,
      supplier: product.supplier,
      unit_cost: product.unit_cost,
    }
  });

  const onSubmit = (data: FormData) => {
    const productData = {
      ...data,
      reorder_recommendation: data.stock <= data.reorder_point,
      unit_cost: data.unit_cost || 0, // Add default unit_cost if not provided
    };
    
    onSave(productData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Make changes to your product here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input id="name" placeholder="Product name" {...field} />
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Input id="category" placeholder="Category" {...field} />
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              Stock
            </Label>
            <Controller
              name="stock"
              control={control}
              render={({ field }) => (
                <Input type="number" id="stock" placeholder="Stock" {...field} />
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="forecast_demand" className="text-right">
              Forecast Demand
            </Label>
            <Controller
              name="forecast_demand"
              control={control}
              render={({ field }) => (
                <Input type="number" id="forecast_demand" placeholder="Forecast Demand" {...field} />
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reorder_point" className="text-right">
              Reorder Point
            </Label>
            <Controller
              name="reorder_point"
              control={control}
              render={({ field }) => (
                <Input type="number" id="reorder_point" placeholder="Reorder Point" {...field} />
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier" className="text-right">
              Supplier
            </Label>
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <Input id="supplier" placeholder="Supplier" {...field} />
              )}
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit_cost" className="text-right">
              Unit Cost
            </Label>
            <Controller
              name="unit_cost"
              control={control}
              render={({ field }) => (
                <Input type="number" id="unit_cost" placeholder="Unit Cost" {...field} />
              )}
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryModal;
