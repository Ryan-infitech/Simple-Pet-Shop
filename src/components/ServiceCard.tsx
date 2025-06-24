import { Clock, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  rating: number;
  available: boolean;
}

const ServiceCard = ({
  id,
  name,
  description,
  price,
  duration,
  image,
  rating,
  available,
}: ServiceCardProps) => {
  const navigate = useNavigate();

  const handleServiceClick = () => {
    navigate(`/services/${id}`);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur">
      <div className="relative cursor-pointer" onClick={handleServiceClick}>
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute top-3 right-3">
          <Badge
            variant={available ? "default" : "secondary"}
            className={available ? "bg-green-500" : "bg-gray-400"}
          >
            {available ? "Tersedia" : "Penuh"}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle
          className="text-lg group-hover:text-primary transition-colors cursor-pointer"
          onClick={handleServiceClick}
        >
          {name}
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-primary" />
            <span>{rating}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">
              Rp {price.toLocaleString("id-ID")}
            </span>
          </div>
          <Button
            disabled={!available}
            className="gradient-pink text-primary-foreground disabled:opacity-50"
            onClick={(e) => {
              e.stopPropagation();
              if (available) {
                navigate(`/services/${id}`);
              }
            }}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Booking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
