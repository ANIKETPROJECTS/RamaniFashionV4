import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Upload, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MediaManagement() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const adminToken = localStorage.getItem("adminToken");

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewHero, setPreviewHero] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  if (!adminToken) {
    setLocation("/admin/login");
    return null;
  }

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) =>
      apiRequest("/api/admin/upload-media", "POST", data as any, true),
    onSuccess: () => {
      toast({
        title: "Media uploaded successfully!",
        description: "Homepage media has been updated.",
      });
      setHeroFile(null);
      setBannerFile(null);
      setVideoFile(null);
      setPreviewHero(null);
      setPreviewBanner(null);
      setPreviewVideo(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error uploading media",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Hero banner must be an image file",
          variant: "destructive",
        });
        return;
      }
      setHeroFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreviewHero(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Banner must be an image file",
          variant: "destructive",
        });
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreviewBanner(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid file",
          description: "Video must be a video file",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreviewVideo(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!heroFile && !bannerFile && !videoFile) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    if (heroFile) formData.append("hero", heroFile);
    if (bannerFile) formData.append("banner", bannerFile);
    if (videoFile) formData.append("video", videoFile);

    uploadMutation.mutate(formData);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-page-title">
              Update Images & Video
            </h2>
            <p className="text-muted-foreground">
              Manage homepage hero section, banner image, and promotional video
            </p>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please ensure your images match the required dimensions to avoid display issues on the homepage
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Hero Banner Section */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Banner</CardTitle>
                <CardDescription>
                  Full-width banner at the top of the homepage. Recommended: Full HD landscape (1920x1080 or wider)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewHero && (
                  <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <img src={previewHero} alt="Hero preview" className="max-h-64 mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{heroFile?.name}</p>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Label htmlFor="hero" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 rounded-md hover:bg-pink-200 dark:hover:bg-pink-800">
                    <Upload className="h-4 w-4" />
                    Choose Hero Image
                  </Label>
                  <input
                    id="hero"
                    type="file"
                    accept="image/*"
                    onChange={handleHeroChange}
                    className="hidden"
                    data-testid="input-hero-image"
                  />
                  {heroFile && <Check className="h-5 w-5 text-green-600" />}
                </div>
              </CardContent>
            </Card>

            {/* Banner Image Section */}
            <Card>
              <CardHeader>
                <CardTitle>Ramani Fashion Banner</CardTitle>
                <CardDescription>
                  Central branding banner section. Recommended: 1200x600 or similar aspect ratio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewBanner && (
                  <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <img src={previewBanner} alt="Banner preview" className="max-h-64 mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{bannerFile?.name}</p>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Label htmlFor="banner" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 rounded-md hover:bg-pink-200 dark:hover:bg-pink-800">
                    <Upload className="h-4 w-4" />
                    Choose Banner Image
                  </Label>
                  <input
                    id="banner"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    data-testid="input-banner-image"
                  />
                  {bannerFile && <Check className="h-5 w-5 text-green-600" />}
                </div>
              </CardContent>
            </Card>

            {/* Video Section */}
            <Card>
              <CardHeader>
                <CardTitle>Promotional Video</CardTitle>
                <CardDescription>
                  Featured video on the homepage. Supports MP4, WebM, and other video formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewVideo && (
                  <div className="mb-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <video src={previewVideo} className="max-h-64 mx-auto" controls />
                    <p className="text-sm text-muted-foreground mt-2">{videoFile?.name}</p>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Label htmlFor="video" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 rounded-md hover:bg-pink-200 dark:hover:bg-pink-800">
                    <Upload className="h-4 w-4" />
                    Choose Video File
                  </Label>
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    data-testid="input-video-file"
                  />
                  {videoFile && <Check className="h-5 w-5 text-green-600" />}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={uploadMutation.isPending || (!heroFile && !bannerFile && !videoFile)}
                data-testid="button-upload-media"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Media"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setHeroFile(null);
                  setBannerFile(null);
                  setVideoFile(null);
                  setPreviewHero(null);
                  setPreviewBanner(null);
                  setPreviewVideo(null);
                }}
                data-testid="button-cancel-upload"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
