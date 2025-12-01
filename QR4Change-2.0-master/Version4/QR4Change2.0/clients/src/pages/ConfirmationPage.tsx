import { useParams, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Copy, 
  Download, 
  Share2, 
  MapPin, 
  Clock, 
  Building, 
  FileText,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ConfirmationPage = () => {
  const { complaintId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const complaintData = location.state?.complaintData;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Complaint ID copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the ID manually",
        variant: "destructive"
      });
    }
  };

  const shareComplaint = async () => {
    const shareData = {
      title: 'QR4Change Complaint Submitted',
      text: `My civic complaint has been submitted with ID: ${complaintId}. Track it on QR4Change.`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to clipboard
        copyToClipboard(`${shareData.text} ${shareData.url}`);
      }
    } else {
      copyToClipboard(`${shareData.text} ${shareData.url}`);
    }
  };

  if (!complaintData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No complaint data found.</p>
            <Button asChild className="mt-4">
              <Link to="/">Return Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-8">
          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-success">Complaint Submitted Successfully!</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your civic issue has been registered and assigned to the appropriate department. 
                You'll receive updates as your complaint progresses.
              </p>
            </div>
          </div>

          {/* Complaint ID Card */}
          <Card className="border-success/20 bg-gradient-to-r from-success/5 to-accent/5">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Your Complaint ID</p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="text-2xl font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg">
                      {complaintId}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(complaintId || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Save this ID to track your complaint status
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={shareComplaint}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complaint Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Complaint Summary</span>
              </CardTitle>
              <CardDescription>
                Review the details of your submitted complaint
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title and Status */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{complaintData.title}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{complaintData.type}</Badge>
                  <Badge className="bg-warning/10 text-warning border-warning/20">
                    {complaintData.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Location</p>
                      <p className="text-sm text-muted-foreground">{complaintData.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Submitted</p>
                      <p className="text-sm text-muted-foreground">{complaintData.timestamp}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Assigned Department</p>
                      <p className="text-sm text-muted-foreground">{complaintData.department}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">AI Classification</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically assigned based on complaint type and description
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <p className="font-medium text-sm mb-2">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {complaintData.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowRight className="h-5 w-5" />
                <span>What Happens Next?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Department Review</p>
                    <p className="text-sm text-muted-foreground">
                      Your complaint will be reviewed by the {complaintData.department} within 24-48 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Field Verification</p>
                    <p className="text-sm text-muted-foreground">
                      If required, a field team will visit the location to assess the issue.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Resolution & Update</p>
                    <p className="text-sm text-muted-foreground">
                      Once resolved, your complaint status will be updated and you'll be notified.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-primary to-gov-blue-light" asChild>
              <Link to={`/track`}>
                Track This Complaint
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/report">
                Report Another Issue
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">
                Return Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;