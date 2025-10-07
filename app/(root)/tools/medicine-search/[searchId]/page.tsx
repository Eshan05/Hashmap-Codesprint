import { notFound } from 'next/navigation';
import dbConnect from '@/utils/dbConnect';
import MedicineSearch, { IMedicineSearch } from '@/models/Medicine';
import DiseaseResultCard from '../_components/disease-result-card';

interface PageProps {
  params: {
    searchId: string;
  };
}

interface DosageInformation {
  adults?: string;
  children?: string;
  specialPopulations?: string;
  dosageForms?: string;
  generalNotes?: string;
}
interface DosageInformationIngredient {
  generalDosageNotes?: string;
}

export interface Medicine {
  name: string;
  function: string;
  commonUses: string[];
  dosageInformation?: DosageInformation;
  administration: string;
  sideEffects: string[];
  additionalInfo: string;
}
interface Ingredient {
  name: string;
  uses: string;
  mechanism: string;
  sideEffects: string[]
  dosageInformation?: DosageInformationIngredient
}

interface SimilarMedicine {
  name: string;
  function: string;
  commonUses: string;
  dosageInformation: DosageInformation;
  similarities: string;
  differences: string;
}

export default async function MedicineSearchResultPage({ params }: PageProps) {
  await dbConnect();
  const { searchId } = await params;

  const searchResult = await MedicineSearch.findOne({ searchId }) as IMedicineSearch | null; // Cast

  if (!searchResult) {
    notFound();
  }

  let resultData: Medicine[] | Medicine | Ingredient[] | Ingredient | SimilarMedicine[] | SimilarMedicine | null = null;
  try {
    resultData = JSON.parse(searchResult.result || "{}");
  } catch (e) {
    console.error("Error parsing result JSON:", e);
    resultData = null;
  }

  const renderResult = () => {
    if (!resultData) {
      return <p>No results found or error parsing data.</p>
    }
    switch (searchResult.searchType) {
      case 'disease':
        // Medicine[]
        return (
          <ul className="grid md:grid-cols-2 xl:grid-cols-3 grid-cols-1 gap-4">
            {(resultData as Medicine[]).map((medicine, index) => (
              <li key={index}>
                <DiseaseResultCard medicine={medicine} />
              </li>
            ))}
          </ul>
        );
      case 'name':
        // Medicine object
        const medicine = resultData as Medicine;
        return (
          <div>
            <p><strong>Name:</strong> {medicine.name}</p>
            <p>Function: {medicine.function}</p>
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
            <p>Additional Info: {medicine.additionalInfo}</p>
          </div>
        );
      case 'sideEffects':
        if (typeof resultData === 'string') {
          return <p>{resultData}</p>;
        } else if (Array.isArray(resultData)) {

          return (
            <ul>
              {(resultData as Medicine[]).map((medicine, index) => (
                <li key={index}>
                  <strong>{medicine.name}</strong>
                  <p>Function: {medicine.function}</p>
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
                  <p>Additional Info: {medicine.additionalInfo}</p>
                </li>
              ))}
            </ul>
          )
        } else {
          return <p>500.</p>;
        }
      case 'ingredient':
        const ingredient = resultData as Ingredient
        return (
          <div>
            <p><strong>Name:</strong> {ingredient.name}</p>
            <p><strong>Uses:</strong> {ingredient.uses}</p>
            <p><strong>Mechanism:</strong> {ingredient.mechanism}</p>
            <p><strong>Side Effects:</strong> {ingredient.sideEffects.join(', ')}</p>
            {ingredient.dosageInformation && (
              <div>
                <p><strong>Dosage Information:</strong></p>
                <p>General Notes: {ingredient.dosageInformation.generalDosageNotes || "N/A"}</p>
              </div>
            )}
          </div>
        );
      case 'similar':
        return (
          <ul>
            {(resultData as SimilarMedicine[]).map((medicine, index) => (
              <li key={index}>
                <strong>{medicine.name}</strong>
                <p>Function: {medicine.function}</p>
                <p>Common Uses: {medicine.commonUses}</p>
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
                <p>Similarity: {medicine.similarities}</p>
                <p>Differences: {medicine.differences}</p>
              </li>
            ))}
          </ul>
        );
      default:
        return <p>No results found.</p>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Medicine Search Results</h1>
      <h2 className="text-xl font-semibold mb-2">Query: {searchResult.query}</h2>
      <h3 className="text-lg mb-4">Search Type: {searchResult.searchType}</h3>
      {resultData ? (
        renderResult()
      ) : (
        <p>Loading...</p>
      )}

      <p className="mt-8 text-sm text-gray-600">
        <strong>Disclaimer:</strong> This information is generated by an AI and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns.
      </p>
    </div>
  );
}