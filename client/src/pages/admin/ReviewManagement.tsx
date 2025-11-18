import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Star, 
  StarOff, 
  Trash2, 
  ShieldCheck,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  User,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface Review {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images: string[];
    category: string;
    price: number;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const limit = 20;

  const adminToken = localStorage.getItem("adminToken");

  const { data: reviewsData, isLoading } = useQuery<{
    reviews: Review[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    stats: {
      totalReviews: number;
      verifiedPurchases: number;
      averageRating: number;
      totalHelpfulVotes: number;
    };
  }>({
    queryKey: ["/api/admin/reviews", searchQuery, ratingFilter, verifiedFilter, sortBy, sortOrder, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (ratingFilter !== 'all') params.set('rating', ratingFilter);
      if (verifiedFilter !== 'all') params.set('verifiedOnly', 'true');
      params.set('sort', sortBy);
      params.set('order', sortOrder);
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const url = `/api/admin/reviews?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch reviews: ${res.statusText}`);
      }

      return res.json();
    },
    enabled: !!adminToken,
  });

  const deleteMutation = useMutation({
    mutationFn: async (review: Review) => {
      return apiRequest(`/api/admin/reviews/${review._id}`, "DELETE");
    },
    onSuccess: (data, review) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"], exact: false });
      if (review.productId?._id) {
        queryClient.invalidateQueries({ queryKey: ["/api/reviews", review.productId._id], exact: false });
        queryClient.invalidateQueries({ queryKey: ["/api/products", review.productId._id] });
      }
      toast({
        title: "Review deleted",
        description: "The review has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (reviewToDelete) {
      deleteMutation.mutate(reviewToDelete);
    }
  };

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;
  const stats = reviewsData?.stats;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      i < rating ? (
        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
      ) : (
        <StarOff key={i} className="h-4 w-4 text-gray-300" />
      )
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "bg-green-500/10 text-green-700 dark:text-green-400";
    if (rating >= 3) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    return "bg-red-500/10 text-red-700 dark:text-red-400";
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const formatFullDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-page-title">
              Product Reviews Management
            </h2>
            <p className="text-muted-foreground">
              Manage all product reviews from customers across your store
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-pink-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-total-reviews">
                  {stats?.totalReviews || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified Purchases</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-verified-purchases">
                  {stats?.verifiedPurchases || 0}
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-avg-rating">
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-pink-100 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Helpful Votes</CardTitle>
                <ThumbsUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-helpful-votes">
                  {stats?.totalHelpfulVotes || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6 border-pink-100 dark:border-gray-700">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                    data-testid="input-search-reviews"
                  />
                </div>

                <Select 
                  value={ratingFilter} 
                  onValueChange={(value) => {
                    setRatingFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger data-testid="select-rating-filter">
                    <SelectValue placeholder="Filter by rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={verifiedFilter} 
                  onValueChange={(value) => {
                    setVerifiedFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger data-testid="select-verified-filter">
                    <SelectValue placeholder="Filter by verification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reviews</SelectItem>
                    <SelectItem value="verified">Verified Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={sortBy} 
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger data-testid="select-sort-by">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="helpful">Helpful Votes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Table */}
          <Card className="border-pink-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">All Reviews</CardTitle>
              <CardDescription>
                Detailed view of all customer reviews with complete information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading reviews...</p>
                  </div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-20">
                  <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No Reviews Found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery || ratingFilter !== 'all' || verifiedFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No reviews have been submitted yet'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card 
                        key={review._id} 
                        className="border-pink-100 dark:border-gray-700"
                        data-testid={`card-review-${review._id}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {review.productId?.images?.[0] ? (
                                <img
                                  src={review.productId.images[0]}
                                  alt={review.productId.name}
                                  className="w-24 h-24 object-cover rounded-lg border border-pink-100 dark:border-gray-700"
                                />
                              ) : (
                                <div className="w-24 h-24 bg-pink-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                  <Package className="h-8 w-8 text-pink-300 dark:text-gray-500" />
                                </div>
                              )}
                            </div>

                            {/* Review Content */}
                            <div className="flex-1 min-w-0">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                      {review.productId?.name || 'Product Deleted'}
                                    </h4>
                                    {review.verifiedPurchase && (
                                      <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {review.productId?.category} • ₹{review.productId?.price?.toLocaleString()}
                                  </p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <Badge className={getRatingColor(review.rating)}>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-current" />
                                      {review.rating}
                                    </div>
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(review)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    data-testid={`button-delete-${review._id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Review Stars */}
                              <div className="flex items-center gap-1 mb-3">
                                {renderStars(review.rating)}
                              </div>

                              {/* Review Title and Comment */}
                              <div className="mb-4">
                                <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  {review.title}
                                </h5>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {review.comment}
                                </p>
                              </div>

                              {/* Customer Info */}
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span className="font-medium">{review.customerName || review.customerId?.name || 'Anonymous'}</span>
                                </div>
                                {review.customerId?.email && (
                                  <span>{review.customerId.email}</span>
                                )}
                                {review.customerId?.phone && (
                                  <span>{review.customerId.phone}</span>
                                )}
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between pt-3 border-t border-pink-100 dark:border-gray-700">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" />
                                    <span>{review.helpful || 0} helpful</span>
                                  </div>
                                  <span>Posted {formatDate(review.createdAt)}</span>
                                  {review.updatedAt !== review.createdAt && (
                                    <span className="text-yellow-600 dark:text-yellow-400">
                                      Updated {formatDate(review.updatedAt)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatFullDate(review.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-pink-100 dark:border-gray-700">
                      <div className="text-sm text-muted-foreground">
                        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} reviews
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          data-testid="button-prev-page"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                            const pageNumber = i + 1;
                            return (
                              <Button
                                key={pageNumber}
                                variant={page === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPage(pageNumber)}
                                className="w-9"
                              >
                                {pageNumber}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page === pagination.totalPages}
                          data-testid="button-next-page"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
              <div className="mt-4 p-3 bg-pink-50 dark:bg-gray-800 rounded-lg">
                <p className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                  {reviewToDelete?.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  By {reviewToDelete?.customerName} • {reviewToDelete?.rating} stars
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
