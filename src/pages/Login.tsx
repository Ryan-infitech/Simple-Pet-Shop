import { useState, useEffect } from "react";
import { Eye, EyeOff, Cat, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/customer");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast({
          title: "Login berhasil!",
          description: "Selamat datang kembali.",
        });
        navigate("/customer");
      } else {
        toast({
          variant: "destructive",
          title: "Login gagal",
          description: "Email atau password salah.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 bg-card/80 backdrop-blur shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Cat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                petshop_viiona
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">
              Selamat Datang Kembali
            </CardTitle>
            <p className="text-muted-foreground">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />{" "}
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />{" "}
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password Anda"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Ingat saya
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                >
                  Lupa password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gradient-purple text-white"
                disabled={isLoading}
              >
                {isLoading ? "Masuk..." : "Masuk"}
              </Button>
            </form>

            {/* Demo Login */}
            <div className="space-y-3 pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Login demo untuk testing:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/customer")}
                >
                  Demo Customer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/admin")}
                >
                  Demo Admin
                </Button>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Belum punya akun?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary hover:underline font-medium"
                >
                  Daftar sekarang
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
