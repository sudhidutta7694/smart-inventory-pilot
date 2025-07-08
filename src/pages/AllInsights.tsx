import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  Clock,
  Target,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { insights, zones } from "@/data/mockData";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

const AllInsights = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");

  // Filter insights based on search and filters
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === "All" || insight.zone === selectedZone;
    const matchesType = selectedType === "All" || insight.type === selectedType;
    const matchesPriority = selectedPriority === "All" || insight.priority === selectedPriority;
    
    return matchesSearch && matchesZone && matchesType && matchesPriority;
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'understock':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'overstock':
        return <Package className="h-5 w-5 text-warning" />;
      case 'forecast':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'delay':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Target className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('AI INSIGHTS SUMMARY REPORT', 20, 30);
    
    // Report details
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Total Insights: ${filteredInsights.length}`, 20, 60);
    
    // Priority breakdown
    const highPriority = filteredInsights.filter(i => i.priority === 'high').length;
    const mediumPriority = filteredInsights.filter(i => i.priority === 'medium').length;
    const lowPriority = filteredInsights.filter(i => i.priority === 'low').length;
    
    doc.text(`High Priority Insights: ${highPriority}`, 20, 80);
    doc.text(`Medium Priority Insights: ${mediumPriority}`, 20, 90);
    doc.text(`Low Priority Insights: ${lowPriority}`, 20, 100);
    
    // Type breakdown
    doc.setFontSize(14);
    doc.text('BREAKDOWN BY TYPE:', 20, 120);
    doc.setFontSize(12);
    
    const typeBreakdown = {
      understock: filteredInsights.filter(i => i.type === 'understock').length,
      overstock: filteredInsights.filter(i => i.type === 'overstock').length,
      forecast: filteredInsights.filter(i => i.type === 'forecast').length,
      delay: filteredInsights.filter(i => i.type === 'delay').length
    };
    
    let yPos = 130;
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      doc.text(`• ${type.charAt(0).toUpperCase() + type.slice(1)} Issues: ${count}`, 20, yPos);
      yPos += 10;
    });
    
    // Zone breakdown
    doc.setFontSize(14);
    doc.text('BREAKDOWN BY ZONE:', 20, yPos + 10);
    doc.setFontSize(12);
    yPos += 20;
    
    zones.filter(z => z !== "All").forEach(zone => {
      const zoneCount = filteredInsights.filter(i => i.zone === zone).length;
      doc.text(`• ${zone}: ${zoneCount} insights`, 20, yPos);
      yPos += 10;
    });
    
    // Add new page for detailed insights
    doc.addPage();
    doc.setFontSize(16);
    doc.text('DETAILED INSIGHTS:', 20, 30);
    
    yPos = 50;
    filteredInsights.forEach((insight, index) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      
      doc.setFontSize(12);
      doc.text(`${index + 1}. [${insight.priority.toUpperCase()}] ${insight.title}`, 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Type: ${insight.type} | Zone: ${insight.zone}`, 25, yPos);
      yPos += 8;
      
      const descLines = doc.splitTextToSize(`Description: ${insight.description}`, 170);
      doc.text(descLines, 25, yPos);
      yPos += descLines.length * 5 + 5;
      
      doc.text(`Impact: ${insight.impact}`, 25, yPos);
      yPos += 8;
      doc.text(`Recommended Action: ${insight.cta}`, 25, yPos);
      yPos += 15;
    });
    
    return doc;
  };

  const handleDownloadSummary = () => {
    const doc = generatePDF();
    doc.save(`AI-Insights-Summary-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "Summary Downloaded",
      description: "AI insights summary has been downloaded as PDF successfully",
    });
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
              <h1 className="text-3xl font-bold">AI Insights Overview</h1>
              <p className="text-muted-foreground">
                Comprehensive view of all AI-generated insights and recommendations
              </p>
            </div>
          </div>
          
          <Button onClick={handleDownloadSummary} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Summary
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search insights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Zone</label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="understock">Understock</SelectItem>
                    <SelectItem value="overstock">Overstock</SelectItem>
                    <SelectItem value="forecast">Forecast</SelectItem>
                    <SelectItem value="delay">Delay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredInsights.length} of {insights.length} insights
          </p>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={getPriorityBadgeVariant(insight.priority)}
                      className={`text-xs ml-2 ${
                        insight.priority === 'medium' ? 'bg-warning text-warning-foreground' : ''
                      }`}
                    >
                      {insight.priority.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Zone:</span>
                      <span className="font-medium">{insight.zone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Impact:</span>
                      <span className="font-medium">{insight.impact}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{insight.type}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    {insight.cta}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInsights.length === 0 && (
          <Card className="p-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No insights found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters to find relevant insights.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AllInsights;
