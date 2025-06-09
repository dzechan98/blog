import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Users,
  Calendar,
  Shield,
  UserIcon,
  MoreHorizontal,
  Crown,
  UserCheck,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as User[];
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Có lỗi xảy ra khi tải người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (
    userId: string,
    newRole: "admin" | "user"
  ) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: new Date(),
      });

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success(`Cập nhật quyền người dùng thành công!`);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Có lỗi xảy ra khi cập nhật quyền người dùng");
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter((user) => user.role === "admin").length,
    regularUsers: users.filter((user) => user.role === "user").length,
    today: users.filter((user) => {
      const today = new Date();
      const userDate = user.createdAt;
      return (
        userDate &&
        userDate.getDate() === today.getDate() &&
        userDate.getMonth() === today.getMonth() &&
        userDate.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground mt-2">
            Xem và quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng người dùng
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quản trị viên
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.regularUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Đăng ký hôm nay
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm người dùng theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={roleFilter}
            onValueChange={(value: "all" | "admin" | "user") =>
              setRoleFilter(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <Shield className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Quyền" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Quản lý tất cả người dùng trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Quyền</TableHead>
                    <TableHead>Ngày đăng ký</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          {searchTerm || roleFilter !== "all"
                            ? "Không tìm thấy người dùng nào"
                            : "Chưa có người dùng nào"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.displayName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{user.displayName}</p>
                              {user.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {user.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role === "admin" ? (
                              <>
                                <Crown className="h-3 w-3 mr-1" />
                                Quản trị viên
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Người dùng
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.createdAt?.toLocaleDateString("vi-VN")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/user/${user.id}`}>
                                  <UserIcon className="h-4 w-4 mr-2" />
                                  Xem hồ sơ
                                </Link>
                              </DropdownMenuItem>
                              {user.role === "user" ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(user.id, "admin")
                                  }
                                >
                                  <Crown className="h-4 w-4 mr-2" />
                                  Thăng cấp Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRoleChange(user.id, "user")
                                  }
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Hạ cấp User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
