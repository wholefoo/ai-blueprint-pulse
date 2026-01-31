import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Download, ArrowRight } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
    queryClient.invalidateQueries({ queryKey: ["/api/purchases/detailed"] });
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16">
      <div className="container max-w-md">
        <Card>
          <CardContent className="pt-8 pb-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2" data-testid="text-success-title">
              Payment Successful!
            </h1>
            
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your blueprint is now available for download.
            </p>
            
            <div className="space-y-3">
              <Link href="/dashboard">
                <Button className="w-full" data-testid="button-go-to-dashboard">
                  <Download className="mr-2 h-4 w-4" />
                  Go to My Purchases
                </Button>
              </Link>
              
              <Link href="/marketplace">
                <Button variant="outline" className="w-full" data-testid="button-browse-more">
                  Browse More Blueprints
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
