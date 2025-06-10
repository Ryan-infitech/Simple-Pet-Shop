
import { Cat, Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Cat className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                petshop_viiona
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Menyediakan kebutuhan terbaik untuk hewan peliharaan kesayangan Anda dengan produk berkualitas dan layanan profesional.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Tautan Cepat</h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Beranda</div>
              <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Produk</div>
              <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Layanan</div>
              <div className="text-muted-foreground hover:text-primary cursor-pointer transition-colors">Tentang Kami</div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Layanan Kami</h3>
            <div className="space-y-2 text-sm">
              <div className="text-muted-foreground">Grooming</div>
              <div className="text-muted-foreground">Vaksinasi</div>
              <div className="text-muted-foreground">Konsultasi</div>
              <div className="text-muted-foreground">Pet Hotel</div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Kontak</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+62 812-3456-7890</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@petshopviiona.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Jl. Pet Love No. 123, Jakarta</span>
              </div>
              <div className="flex space-x-3 pt-2">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2024 petshop_viiona. Semua hak dilindungi.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
