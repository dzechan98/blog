import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, SortAsc, SortDesc } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface FilterState {
  search: string;
  category: string;
  sortBy: "newest" | "oldest" | "title-asc" | "title-desc";
  tags: string[];
}

interface BlogFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalResults: number;
}

export const BlogFilters: React.FC<BlogFiltersProps> = ({
  filters,
  onFiltersChange,
  totalResults,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name"));
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Category[];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value === "all" ? "" : value });
  };

  const handleSortChange = (value: FilterState["sortBy"]) => {
    onFiltersChange({ ...filters, sortBy: value });
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      onFiltersChange({ ...filters, tags: [...filters.tags, tag] });
    }
  };

  const handleTagRemove = (tag: string) => {
    onFiltersChange({
      ...filters,
      tags: filters.tags.filter((t) => t !== tag),
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      category: "",
      sortBy: "newest",
      tags: [],
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category ||
    filters.tags.length > 0 ||
    filters.sortBy !== "newest";

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={filters.category || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                {filters.sortBy === "newest" || filters.sortBy === "oldest" ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSortChange("newest")}>
                <SortDesc className="mr-2 h-4 w-4" />
                Mới nhất
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("oldest")}>
                <SortAsc className="mr-2 h-4 w-4" />
                Cũ nhất
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("title-asc")}>
                <SortAsc className="mr-2 h-4 w-4" />
                Tiêu đề A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange("title-desc")}>
                <SortDesc className="mr-2 h-4 w-4" />
                Tiêu đề Z-A
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={showAdvanced ? "bg-primary/10" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Lọc theo tags
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập tag và nhấn Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    handleTagAdd(target.value.trim());
                    target.value = "";
                  }
                }}
                className="flex-1"
              />
            </div>
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => handleTagRemove(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results and Clear */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Tìm thấy {totalResults} bài viết</span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline">
              Tìm kiếm: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleSearchChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="outline">
              Danh mục:{" "}
              {categories.find((c) => c.id === filters.category)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleCategoryChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.sortBy !== "newest" && (
            <Badge variant="outline">
              Sắp xếp:{" "}
              {filters.sortBy === "oldest"
                ? "Cũ nhất"
                : filters.sortBy === "title-asc"
                ? "Tiêu đề A-Z"
                : "Tiêu đề Z-A"}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
