import { Star, Heart, Users, Award, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const About = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Dokter Hewan Senior",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
      experience: "15 tahun pengalaman",
    },
    {
      name: "Dr. Michael Chen",
      role: "Spesialis Bedah Hewan",
      image:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400",
      experience: "12 tahun pengalaman",
    },
    {
      name: "Lisa Rodriguez",
      role: "Groomer Profesional",
      image:
        "https://images.unsplash.com/photo-1594824982818-e70bb37ca8b4?w=400",
      experience: "8 tahun pengalaman",
    },
  ];

  const achievements = [
    {
      icon: Award,
      title: "Sertifikat ISO 9001",
      description: "Standar kualitas internasional untuk layanan hewan",
    },
    {
      icon: Users,
      title: "1000+ Pelanggan Setia",
      description:
        "Telah melayani ribuan hewan peliharaan dengan kepuasan tinggi",
    },
    {
      icon: Heart,
      title: "99% Rating Kepuasan",
      description: "Tingkat kepuasan pelanggan yang sangat tinggi",
    },
    {
      icon: Star,
      title: "5 Tahun Beroperasi",
      description: "Pengalaman terpercaya dalam industri perawatan hewan",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-rose-50/30">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Tentang{" "}
              <span className="bg-gradient-to-r from-purple-600 via-rose-500 to-purple-700 bg-clip-text text-transparent">
                Viiona Pet Shop
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Kami adalah petshop terpercaya yang telah melayani kebutuhan hewan
              peliharaan dengan dedikasi tinggi sejak 2019. Komitmen kami adalah
              memberikan yang terbaik untuk keluarga berbulu Anda.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Misi Kami</h2>
                <p className="text-muted-foreground">
                  Menyediakan produk berkualitas tinggi dan layanan profesional
                  untuk kesehatan dan kebahagiaan hewan peliharaan. Kami percaya
                  bahwa setiap hewan layak mendapatkan perawatan terbaik.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Visi Kami</h2>
                <p className="text-muted-foreground">
                  Menjadi petshop terdepan yang mengutamakan kesejahteraan hewan
                  dan kepuasan pelanggan melalui inovasi dan pelayanan yang
                  berkelanjutan.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600"
                alt="Pet care"
                className="rounded-2xl shadow-2xl w-full"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">5+</div>
                  <div className="text-sm text-muted-foreground">
                    Tahun Pengalaman
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-background/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Pencapaian Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Prestasi dan pengakuan yang telah kami raih dalam melayani
              komunitas pet lovers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <Card
                key={index}
                className="text-center p-6 border-0 bg-card/50 backdrop-blur hover:shadow-lg transition-all"
              >
                <CardContent className="space-y-4 p-0">
                  <div className="w-16 h-16 gradient-pink rounded-full flex items-center justify-center mx-auto">
                    <achievement.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tim Profesional Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tim ahli yang berpengalaman dan mencintai hewan peliharaan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="text-center border-0 bg-card/50 backdrop-blur hover:shadow-lg transition-all"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-32 h-32 mx-auto overflow-hidden rounded-full">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium">{member.role}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.experience}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Hubungi Kami</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Siap membantu Anda dan hewan peliharaan kesayangan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 gradient-purple rounded-full flex items-center justify-center mx-auto">
                  <Phone className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Telepon</h3>
                  <p className="text-muted-foreground">+62 812-3456-7890</p>
                  <p className="text-sm text-muted-foreground">
                    Senin - Minggu, 08:00 - 21:00
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 gradient-purple rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-muted-foreground">
                    info@viionapetshop.com
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Respon dalam 24 jam
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-0 bg-card/50 backdrop-blur">
              <CardContent className="space-y-4 p-0">
                <div className="w-12 h-12 gradient-purple rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Lokasi</h3>
                  <p className="text-muted-foreground">Jl. Pet Love No. 123</p>
                  <p className="text-sm text-muted-foreground">
                    Jakarta Selatan, 12345
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-purple text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Bergabunglah dengan Keluarga Besar Kami
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Wujudkan kebahagiaan hewan peliharaan Anda bersama tim profesional
            kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-purple-700 hover:bg-purple-50"
            >
              Hubungi Kami
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Lihat Layanan
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
