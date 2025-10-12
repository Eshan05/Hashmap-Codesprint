"use client";

import AddressAutoComplete, {
  AddressType,
} from "@/components/features/address";
import { useState } from "react";

export const AutocompleteComponent = ({ onAddressChange }: { onAddressChange?: (address: AddressType) => void }) => {
  const [address, setAddress] = useState<AddressType>({
    address1: "",
    address2: "",
    formattedAddress: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    lat: 0,
    lng: 0,
  });
  const [searchInput, setSearchInput] = useState("");

  const handleSetAddress = (newAddress: AddressType) => {
    setAddress(newAddress);
    onAddressChange?.(newAddress);
  };

  return (
    <AddressAutoComplete
      address={address}
      setAddress={handleSetAddress}
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      dialogTitle="Enter Address"
    />
  );
};