
-- Create users table for warehouse assignments
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  warehouse text NOT NULL CHECK (warehouse IN ('South', 'East')),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  sku text UNIQUE NOT NULL,
  category text NOT NULL,
  stock_level integer NOT NULL DEFAULT 0,
  reorder_point integer NOT NULL DEFAULT 0,
  forecast_demand integer NOT NULL DEFAULT 0,
  zone text NOT NULL,
  supplier text NOT NULL,
  unit_cost decimal(10,2) NOT NULL DEFAULT 0,
  demand_trend text NOT NULL DEFAULT 'stable',
  last_replenished date NOT NULL DEFAULT CURRENT_DATE,
  warehouse text NOT NULL CHECK (warehouse IN ('South', 'East')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse text NOT NULL CHECK (warehouse IN ('South', 'East')),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create reroutes table
CREATE TABLE public.reroutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  from_warehouse text NOT NULL CHECK (from_warehouse IN ('South', 'East')),
  to_warehouse text NOT NULL CHECK (to_warehouse IN ('South', 'East')),
  quantity integer NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'transit_prep', 'in_transit', 'delivered', 'completed', 'rejected')),
  requested_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  transit_started_at timestamp with time zone,
  delivered_at timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_delivery timestamp with time zone,
  transit_progress integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_warehouse text NOT NULL CHECK (target_warehouse IN ('South', 'East')),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  reroute_id uuid REFERENCES public.reroutes(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create AI insights table
CREATE TABLE public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse text NOT NULL CHECK (warehouse IN ('South', 'East')),
  title text NOT NULL,
  description text NOT NULL,
  impact text NOT NULL CHECK (impact IN ('Low', 'Medium', 'High', 'Critical')),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  category text NOT NULL,
  action_recommended text,
  product_name text,
  zone text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reroutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Create RLS policies for inventory table
CREATE POLICY "Users can view inventory for their warehouse" ON public.inventory
  FOR SELECT USING (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert inventory for their warehouse" ON public.inventory
  FOR INSERT WITH CHECK (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update inventory for their warehouse" ON public.inventory
  FOR UPDATE USING (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete inventory for their warehouse" ON public.inventory
  FOR DELETE USING (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

-- Create RLS policies for tasks table
CREATE POLICY "Users can view tasks for their warehouse" ON public.tasks
  FOR SELECT USING (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert tasks for their warehouse" ON public.tasks
  FOR INSERT WITH CHECK (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update tasks for their warehouse" ON public.tasks
  FOR UPDATE USING (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can delete tasks for their warehouse" ON public.tasks
  FOR DELETE USING (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

-- Create RLS policies for reroutes table
CREATE POLICY "Users can view reroutes involving their warehouse" ON public.reroutes
  FOR SELECT USING (
    from_warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid()) OR
    to_warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert reroutes from their warehouse" ON public.reroutes
  FOR INSERT WITH CHECK (
    from_warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update reroutes involving their warehouse" ON public.reroutes
  FOR UPDATE USING (
    from_warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid()) OR
    to_warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

-- Create RLS policies for notifications table
CREATE POLICY "Users can view notifications for their warehouse" ON public.notifications
  FOR SELECT USING (
    target_warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update notifications for their warehouse" ON public.notifications
  FOR UPDATE USING (
    target_warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

-- Create RLS policies for AI insights table
CREATE POLICY "Users can view AI insights for their warehouse" ON public.ai_insights
  FOR SELECT USING (
    warehouse = (SELECT warehouse FROM public.users WHERE id = auth.uid())
  );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, warehouse, name)
  VALUES (
    new.id,
    new.email,
    CASE 
      WHEN new.email = 'admin1@supply.com' THEN 'South'
      WHEN new.email = 'admin2@supply.com' THEN 'East'
      ELSE 'South'
    END,
    CASE 
      WHEN new.email = 'admin1@supply.com' THEN 'Sarah Johnson'
      WHEN new.email = 'admin2@supply.com' THEN 'Mike Chen'
      ELSE 'Admin User'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable realtime for all tables
ALTER TABLE public.inventory REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.reroutes REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.ai_insights REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reroutes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_insights;

-- Insert sample data for South warehouse
INSERT INTO public.inventory (product_name, sku, category, stock_level, reorder_point, forecast_demand, zone, supplier, unit_cost, demand_trend, warehouse) VALUES
('Industrial Pumps', 'SKU001', 'Machinery', 45, 20, 30, 'Zone A', 'HydroTech Solutions', 1250.00, 'increasing', 'South'),
('Steel Cables', 'SKU002', 'Hardware', 120, 50, 40, 'Zone B', 'MetalWorks Inc', 85.50, 'stable', 'South'),
('Safety Helmets', 'SKU003', 'Safety Equipment', 200, 75, 60, 'Zone C', 'SafeGuard Corp', 45.00, 'decreasing', 'South'),
('Electric Motors', 'SKU004', 'Electronics', 30, 15, 25, 'Zone A', 'PowerTech Ltd', 850.00, 'increasing', 'South'),
('Rubber Gaskets', 'SKU005', 'Components', 500, 100, 80, 'Zone B', 'SealPro Industries', 12.75, 'stable', 'South');

-- Insert sample data for East warehouse
INSERT INTO public.inventory (product_name, sku, category, stock_level, reorder_point, forecast_demand, zone, supplier, unit_cost, demand_trend, warehouse) VALUES
('Hydraulic Valves', 'SKU006', 'Machinery', 35, 25, 35, 'Zone A', 'FlowControl Systems', 320.00, 'increasing', 'East'),
('Aluminum Sheets', 'SKU007', 'Materials', 80, 30, 45, 'Zone B', 'LightMetal Co', 125.00, 'stable', 'East'),
('Work Gloves', 'SKU008', 'Safety Equipment', 150, 60, 70, 'Zone C', 'SafeGuard Corp', 18.50, 'stable', 'East'),
('Circuit Breakers', 'SKU009', 'Electronics', 25, 10, 20, 'Zone A', 'ElectroSafe Inc', 95.00, 'decreasing', 'East'),
('Pipe Fittings', 'SKU010', 'Components', 300, 80, 90, 'Zone B', 'ConnectPro Ltd', 28.00, 'increasing', 'East');

-- Insert sample tasks for South warehouse
INSERT INTO public.tasks (warehouse, title, description, status, priority, due_date) VALUES
('South', 'Review Q4 Inventory Report', 'Analyze quarterly inventory turnover and identify optimization opportunities', 'pending', 'high', NOW() + INTERVAL '2 days'),
('South', 'Update Safety Protocols', 'Review and update warehouse safety procedures according to new regulations', 'in_progress', 'medium', NOW() + INTERVAL '1 week'),
('South', 'Coordinate with East Warehouse', 'Plan upcoming stock transfers and logistics coordination', 'pending', 'medium', NOW() + INTERVAL '3 days');

-- Insert sample tasks for East warehouse
INSERT INTO public.tasks (warehouse, title, description, status, priority, due_date) VALUES
('East', 'Optimize Zone A Layout', 'Reorganize Zone A to improve picking efficiency and reduce travel time', 'pending', 'high', NOW() + INTERVAL '1 week'),
('East', 'Supplier Performance Review', 'Evaluate current suppliers and negotiate new contracts for Q1', 'in_progress', 'high', NOW() + INTERVAL '5 days'),
('East', 'Equipment Maintenance Schedule', 'Schedule preventive maintenance for all warehouse equipment', 'pending', 'low', NOW() + INTERVAL '2 weeks');

-- Insert sample AI insights for South warehouse  
INSERT INTO public.ai_insights (warehouse, title, description, impact, severity, category, action_recommended, product_name, zone) VALUES
('South', 'Low Stock Alert: Industrial Pumps', 'Industrial Pumps inventory is approaching reorder point. Current stock: 45 units, Reorder point: 20 units', 'Medium', 'warning', 'Inventory Management', 'Consider reordering Industrial Pumps to avoid stockout', 'Industrial Pumps', 'Zone A'),
('South', 'High Demand Forecast: Electric Motors', 'Electric Motors showing increased demand trend. 7-day forecast: 25 units vs current stock: 30 units', 'High', 'info', 'Demand Planning', 'Monitor closely and prepare for potential reorder', 'Electric Motors', 'Zone A'),
('South', 'Overstock Alert: Safety Helmets', 'Safety Helmets inventory is significantly above reorder point with decreasing demand', 'Low', 'info', 'Inventory Optimization', 'Consider adjusting reorder quantities or promoting sales', 'Safety Helmets', 'Zone C');

-- Insert sample AI insights for East warehouse
INSERT INTO public.ai_insights (warehouse, title, description, impact, severity, category, action_recommended, product_name, zone) VALUES
('East', 'Critical Stock: Circuit Breakers', 'Circuit Breakers are running critically low. Immediate reorder recommended', 'Critical', 'error', 'Inventory Management', 'Reorder Circuit Breakers immediately', 'Circuit Breakers', 'Zone A'),
('East', 'Supplier Delay Risk: Hydraulic Valves', 'FlowControl Systems has historically delayed deliveries by 2-3 days', 'Medium', 'warning', 'Supply Chain Risk', 'Consider backup supplier or early ordering', 'Hydraulic Valves', 'Zone A'),
('East', 'Efficiency Opportunity: Zone B', 'Zone B shows 15% higher picking times compared to other zones', 'Medium', 'info', 'Operational Efficiency', 'Review Zone B layout and optimize product placement', NULL, 'Zone B');
