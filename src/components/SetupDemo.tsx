
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setupDemoUsers } from "@/utils/setupDemoUsers";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const SetupDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSetupDemo = async () => {
    setIsLoading(true);
    try {
      await setupDemoUsers();
      toast({
        title: "Success",
        description: "Demo users created successfully! You can now log in with the provided credentials.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to create demo users. Please check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Setup Demo Users</CardTitle>
        <CardDescription>
          Create demo users to test the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleSetupDemo} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Users...
            </>
          ) : (
            "Create Demo Users"
          )}
        </Button>
        
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <p className="font-medium mb-2">This will create:</p>
          <ul className="space-y-1">
            <li>• admin1@supply.com (South Warehouse)</li>
            <li>• admin2@supply.com (East Warehouse)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupDemo;
