
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Filter,
  FileText,
  Calendar,
  BarChart3,
  TrendingUp,
  Package,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Report {
  id: string;
  title: string;
  type: 'inventory' | 'sales' | 'performance' | 'forecast' | 'compliance';
  status: 'completed' | 'processing' | 'scheduled';
  createdDate: string;
  createdBy: string;
  description: string;
  tags: string[];
  fileSize: string;
  zone?: string;
}

const Reports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedZone, setSelectedZone] = useState("All");
  const [sortBy, setSortBy] = useState("date");

  // Mock reports data
  const reports: Report[] = [
    {
      id: "RPT001",
      title: "Weekly Inventory Analysis",
      type: "inventory",
      status: "completed",
      createdDate: "2025-07-07",
      createdBy: "Admin User",
      description: "Comprehensive analysis of inventory levels, turnover rates, and stock optimization recommendations.",
      tags: ["inventory", "weekly", "analysis"],
      fileSize: "2.4 MB",
      zone: "All"
    },
    {
      id: "RPT002",
      title: "North Zone Sales Performance",
      type: "sales",
      status: "completed",
      createdDate: "2025-07-06",
      createdBy: "Sales Manager",
      description: "Detailed sales metrics and performance indicators for the North zone operations.",
      tags: ["sales", "north", "performance"],
      fileSize: "1.8 MB",
      zone: "North"
    },
    {
      id: "RPT003",
      title: "Q2 Compliance Audit",
      type: "compliance",
      status: "processing",
      createdDate: "2025-07-05",
      createdBy: "Compliance Officer",
      description: "Quarterly compliance audit covering safety protocols, inventory management, and regulatory requirements.",
      tags: ["compliance", "audit", "q2"],
      fileSize: "3.1 MB",
      zone: "All"
    },
    {
      id: "RPT004",
      title: "Demand Forecast Model",
      type: "forecast",
      status: "completed",
      createdDate: "2025-07-04",
      createdBy: "AI System",
      description: "Machine learning-generated demand forecasts for the next 30 days across all product categories.",
      tags: ["forecast", "ml", "demand"],
      fileSize: "5.2 MB",
      zone: "All"
    },
    {
      id: "RPT005",
      title: "South Zone Performance Metrics",
      type: "performance",
      status: "completed",
      createdDate: "2025-07-03",
      createdBy: "Operations Manager",
      description: "Operational efficiency metrics including throughput, accuracy, and worker productivity for South zone.",
      tags: ["performance", "south", "metrics"],
      fileSize: "1.5 MB",
      zone: "South"
    },
    {
      id: "RPT006",
      title: "Monthly Inventory Snapshot",
      type: "inventory",
      status: "scheduled",
      createdDate: "2025-07-08",
      createdBy: "System Scheduler",
      description: "Automated monthly inventory snapshot scheduled for end of month processing.",
      tags: ["inventory", "monthly", "automated"],
      fileSize: "TBD",
      zone: "All"
    },
    {
      id: "RPT007",
      title: "East Zone Sales Trends",
      type: "sales",
      status: "completed",
      createdDate: "2025-07-02",
      createdBy: "Regional Manager",
      description: "Analysis of sales trends, customer behavior, and market opportunities in the East zone.",
      tags: ["sales", "east", "trends"],
      fileSize: "2.1 MB",
      zone: "East"
    },
    {
      id: "RPT008",
      title: "Supply Chain Optimization",
      type: "performance",
      status: "completed",
      createdDate: "2025-07-01",
      createdBy: "Supply Chain Manager",
      description: "End-to-end supply chain analysis with optimization recommendations and cost reduction strategies.",
      tags: ["supply-chain", "optimization", "cost"],
      fileSize: "4.3 MB",
      zone: "All"
    }
  ];

  // Filter and sort reports
  const filteredAndSortedReports = useMemo(() => {
    let filtered = reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === "All" || report.type === selectedType;
      const matchesStatus = selectedStatus === "All" || report.status === selectedStatus;
      const matchesZone = selectedZone === "All" || report.zone === selectedZone;
      
      return matchesSearch && matchesType && matchesStatus && matchesZone;
    });

    // Sort reports
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "type":
          return a.type.localeCompare(b.type);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reports, searchTerm, selectedType, selectedStatus, selectedZone, sortBy]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <Package className="h-4 w-4" />;
      case 'sales':
        return <TrendingUp className="h-4 w-4" />;
      case 'performance':
        return <BarChart3 className="h-4 w-4" />;
      case 'forecast':
        return <Calendar className="h-4 w-4" />;
      case 'compliance':
        return <Users className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleDownload = (report: Report) => {
    if (report.status !== 'completed') {
      toast({
        title: "Download Not Available",
        description: "This report is not yet available for download",
        variant: "destructive",
      });
      return;
    }

    // Mock PDF generation and download
    const pdfContent = `
SUPPLY CHAIN INTELLIGENCE REPORT
================================

Report ID: ${report.id}
Title: ${report.title}
Type: ${report.type.toUpperCase()}
Created: ${new Date(report.createdDate).toLocaleDateString()}
Created By: ${report.createdBy}
Zone: ${report.zone || 'All Zones'}

DESCRIPTION:
${report.description}

TAGS: ${report.tags.join(', ')}

EXECUTIVE SUMMARY:
This is a mock PDF report generated for demonstration purposes. In a real implementation, this would contain comprehensive data analysis, charts, and actionable insights based on the report type.

KEY FINDINGS:
- Inventory turnover has improved by 15% compared to last month
- Stock levels are optimized in 87% of tracked categories  
- Recommended actions have been identified for underperforming areas
- Forecast accuracy is maintained at 94% confidence level

RECOMMENDATIONS:
1. Continue current optimization strategies
2. Monitor identified risk areas closely
3. Implement suggested process improvements
4. Schedule follow-up analysis in 30 days

---
Generated by SupplyChain AI Platform
Report Date: ${new Date().toLocaleDateString()}
    `.trim();

    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '-')}-${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: `${report.title} has been downloaded successfully`,
    });
  };

  const handleBulkDownload = () => {
    const completedReports = filteredAndSortedReports.filter(r => r.status === 'completed');
    if (completedReports.length === 0) {
      toast({
        title: "No Reports Available",
        description: "No completed reports available for bulk download",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bulk Download Started",
      description: `Preparing ${completedReports.length} reports for download`,
    });

    // Simulate bulk download
    setTimeout(() => {
      toast({
        title: "Bulk Download Complete",
        description: "All selected reports have been packaged and downloaded",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Reports</h1>
              <p className="text-muted-foreground">
                Access and download all generated reports and analytics
              </p>
            </div>
          </div>
          
          <Button onClick={handleBulkDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Bulk Download
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="inventory">Inventory</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="forecast">Forecast</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Zone</label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Zones</SelectItem>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedReports.length} of {reports.length} reports
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(report.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg leading-tight">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(report.status)} className="ml-2">
                      {report.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{new Date(report.createdDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created By:</span>
                      <span className="font-medium">{report.createdBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{report.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">File Size:</span>
                      <span className="font-medium">{report.fileSize}</span>
                    </div>
                    {report.zone && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Zone:</span>
                        <span className="font-medium">{report.zone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {report.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground">
                      ID: {report.id}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(report)}
                      disabled={report.status !== 'completed'}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedReports.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find relevant reports.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reports;
