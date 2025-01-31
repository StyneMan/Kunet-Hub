import axios from 'axios';

export default async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<number> {
  const mapAPIKey = process.env.GOOGLE_MAP_API_KEY ?? '';
  const orig = `${origin?.lat}, ${origin?.lng}`;
  const dest = `${destination?.lat}, ${destination?.lng}`;

  console.log('ORIGIN :: ', orig);
  console.log('DESTINATIONO :: ', dest);

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${orig}&destinations=${dest}&key=${mapAPIKey}`;

  const response = await axios.get(url);
  const result = response.data;

  console.log('dIST CALCULATOR RESULT ::: ', result.rows[0].elements[0]);

  return result.rows[0].elements[0].distance?.value / 1000; // Convert to km
}
