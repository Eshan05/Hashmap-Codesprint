import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Medicine } from "../[searchId]/page";

interface DiseaseResultCardProps {
  medicine: Medicine
}

export default function DiseaseResultCard({ medicine }: DiseaseResultCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{medicine.name}</CardTitle>
        <CardDescription>Function: {medicine.function}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Common Uses: {medicine.commonUses.join(', ')}</p>
        {medicine.dosageInformation && (
          <div>
            <p><strong>Dosage Information:</strong></p>
            <p>Adults: {medicine.dosageInformation.adults || "N/A"}</p>
            <p>Children: {medicine.dosageInformation.children || "N/A"}</p>
            <p>Special Populations: {medicine.dosageInformation.specialPopulations || "N/A"}</p>
            <p>Dosage Forms: {medicine.dosageInformation.dosageForms || "N/A"}</p>
            <p>General Notes: {medicine.dosageInformation.generalNotes || "N/A"}</p>
          </div>
        )}
        <p>Administration: {medicine.administration}</p>
        <p>Side Effects: {medicine.sideEffects.join(', ')}</p>
      </CardContent>
      <CardFooter>
        <p>Additional Info: {medicine.additionalInfo}</p>
      </CardFooter>
    </Card>
  );
}