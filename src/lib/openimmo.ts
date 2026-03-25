// OpenImmo XML Feed Generator
// Generates XML feed for Immowelt, Immonet, ImmoStreet and other feed-based portals

import { Listing } from '@/types/listing';

export function generateOpenImmoXML(listings: Listing[], agentId: string): string {
  const now = new Date().toISOString();
  
  const listingsXml = listings.map(listing => generateListingXml(listing)).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<openimmo xmlns="http://www.openimmo.de/openimmo" version="1.2.7">
  <uebertragung art="ONLINE" umfang="VOLL" modus="NEW" sendezeit="${now}" sender-id="${agentId}"/>
  <anbieter>
    <anbieterid>${agentId}</anbieterid>
    <immobilien>
${listingsXml}
    </immobilien>
  </anbieter>
</openimmo>`;
}

function generateListingXml(listing: Listing): string {
  const actionType = listing.publish_status === 'archived' ? 'DELETE' : 'NEW';
  
  return `      <immobilie>
        <aktion aktionart="${actionType}"/>
        <objektkategorie>
          <nutzungsart WOHNEN="${listing.property_type === 'apartment' || listing.property_type === 'house' ? 'true' : 'false'}"/>
          <vermarktungsart KAUF="${listing.transaction_type === 'sale' ? 'true' : 'false'}" MIETE_PACHT="${listing.transaction_type === 'rent' ? 'true' : 'false'}"/>
          <objektart>
            ${getObjectArtXml(listing.property_type)}
          </objektart>
        </objektkategorie>
        <geo>
          <plz>${listing.postal_code || ''}</plz>
          <ort>${listing.city}</ort>
          <strasse>${listing.street || ''} ${listing.house_number || ''}</strasse>
          <land iso-country="DEU"/>
          ${listing.district ? `<regionalbezirk>${listing.district}</regionalbezirk>` : ''}
        </geo>
        <kontaktperson>
          <email_direkt>agent@example.com</email_direkt>
        </kontaktperson>
        <preise>
          <kaufpreis auf_anfrage="${listing.price ? 'false' : 'true'}">${listing.price ? listing.price / 100 : ''}</kaufpreis>
          <waehrung iso_waehrung="EUR"/>
        </preise>
        <flaechen>
          <wohnflaeche>${listing.living_area || ''}</wohnflaeche>
          ${listing.plot_area ? `<grundflaeche>${listing.plot_area}</grundflaeche>` : ''}
          <anzahl_zimmer>${listing.rooms || ''}</anzahl_zimmer>
          ${listing.bedrooms ? `<anzahl_schlafzimmer>${listing.bedrooms}</anzahl_schlafzimmer>` : ''}
          ${listing.bathrooms ? `<anzahl_badezimmer>${listing.bathrooms}</anzahl_badezimmer>` : ''}
        </flaechen>
        <ausstattung>
          ${listing.features?.has_balcony ? '<balkon>true</balkon>' : ''}
          ${listing.features?.has_terrace ? '<terrasse>true</terrasse>' : ''}
          ${listing.features?.has_garden ? '<garten>true</garten>' : ''}
          ${listing.features?.has_basement ? '<keller>true</keller>' : ''}
          ${listing.features?.has_elevator ? '<aufzug>true</aufzug>' : ''}
          ${listing.features?.has_parking ? '<stellplatz>true</stellplatz>' : ''}
          ${listing.features?.pets_allowed ? '<haustiere>true</haustiere>' : ''}
          ${listing.features?.built_in_kitchen ? '<einbauküche>true</einbauküche>' : ''}
          ${listing.features?.has_fireplace ? '<kamin>true</kamin>' : ''}
          ${listing.features?.has_pool ? '<pool>true</pool>' : ''}
        </ausstattung>
        <zustand_angaben>
          ${listing.construction_year ? `<baujahr>${listing.construction_year}</baujahr>` : ''}
          ${listing.energy_rating ? `<energiepass><energieeffizienz>${listing.energy_rating}</energieeffizienz></energiepass>` : ''}
        </zustand_angaben>
        <freitexte>
          <objekttitel>${escapeXml(listing.title || '')}</objekttitel>
          <objektbeschreibung>${escapeXml(listing.description || '')}</objektbeschreibung>
        </freitexte>
        <anhaenge>
          ${listing.media_ids?.map((id, i) => `<anhang location="EXTERN" gruppe="BILD"><anhangtitel>Bild ${i + 1}</anhangtitel><format>JPG</format><daten><pfad>/media/${id}</pfad></daten></anhang>`).join('\n          ') || ''}
        </anhaenge>
      </immobilie>`;
}

function getObjectArtXml(propertyType: string): string {
  const types: Record<string, string> = {
    apartment: '<wohnung/>',
    house: '<haus haustyp="EINFAMILIENHAUS"/>',
    commercial: '<gewerbe gewerbetyp="BUERO"/>',
    land: '<grundstueck/>',
    garage: '<garage/>',
    other: '<sonstiges/>',
  };
  return types[propertyType] || types.other;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
