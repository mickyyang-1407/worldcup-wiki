import { countries } from "@/data/countries";
import CountriesListClient from "@/components/CountriesListClient";

export default function CountriesPage() {
  return <CountriesListClient countries={countries as any[]} />;
}
