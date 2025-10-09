// src/pdf/QuoteDoc.tsx
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Quote, QuoteItem, Brand } from "../models";
import type { ItemType } from "../stores/quoteDraft";
import { imageForQuote } from "../catalog/imageCatalog";

/** Helper para respetar el base path de GH Pages */
const withBase = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, "");

/** Registro de fuentes (usar rutas resolvidas con BASE_URL) */
try {
  Font.register({
    family: "Roboto",
    src: withBase("fonts/Roboto-Regular.ttf"),
  });
  Font.register({
    family: "Roboto-Bold",
    src: withBase("fonts/Roboto-Bold.ttf"),
  });
} catch {}

/** Paleta */
const COLORS = {
  primary: "#1e40af",
  dark: "#111827",
  gray: "#6b7280",
  grayLight: "#f3f4f6",
  border: "#e5e7eb",
  white: "#ffffff",
};

/** Estilos */
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 10,
    padding: 24,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },

  header: { flexDirection: "row", gap: 16 },

  brandCard: {
    width: 190,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  logoWrap: {
    width: 152,
    height: 152,
    borderRadius: 12,
    backgroundColor: COLORS.grayLight,
    overflow: "hidden",
    marginBottom: 10,
    alignSelf: "center",
  },
  logo: { width: "100%", height: "100%", objectFit: "contain" },

  quoteHeader: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginLeft: 4,
    flex: 1,
  },
  quoteTitle: { color: COLORS.white, fontSize: 18, fontFamily: "Roboto-Bold" },
  quoteSubTitle: { color: COLORS.white, marginTop: 4 },

  infoGrid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoRow: {
    width: "48%",
    flexDirection: "row",
    gap: 6,
    alignItems: "baseline",
  },
  infoLabel: { fontFamily: "Roboto-Bold", color: COLORS.white, width: 120 },
  infoValue: { color: COLORS.white, flex: 1 },

  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 12,
    fontFamily: "Roboto-Bold",
    color: COLORS.dark,
  },

  itemCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  itemRow: { flexDirection: "row", gap: 12 },
  itemInfoSection: { flex: 1, paddingRight: 16 },
  itemImageSection: { width: 180, alignItems: "center" },
  itemImage: {
    width: 160,
    height: 120,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    objectFit: "cover",
  },
  itemTitle: { fontFamily: "Roboto-Bold", fontSize: 11, marginBottom: 6 },
  itemGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.grayLight,
  },
  chipText: { fontSize: 9, color: COLORS.dark },

  summaryCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  summaryHeader: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    padding: 10,
    fontFamily: "Roboto-Bold",
  },
  summaryRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
  },
  summaryLabel: { width: "60%" },
  summaryValue: { width: "40%", textAlign: "right", fontFamily: "Roboto-Bold" },

  footer: {
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    color: COLORS.gray,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { color: COLORS.gray },
});

/** Utils */
const peso = (cents: number) =>
  `$${Math.round(cents / 1).toLocaleString("es-CL")}`;

const safe = <T,>(v: T | null | undefined, fallback: T): T =>
  v == null ? fallback : v;

const dateFromMillis = (ms?: number) =>
  ms
    ? new Date(ms).toLocaleDateString("es-CL")
    : new Date().toLocaleDateString("es-CL");

/** Componente principal */
export function QuoteDoc({
  quote,
  items,
  brand,
  logoSrc = withBase("icons/icon-192.png"),
}: {
  quote: Quote;
  items: (QuoteItem & { type?: ItemType; options?: any })[];
  brand: Brand;
  logoSrc?: string;
}) {
  const clientName =
    (quote as any).clientName ??
    [
      safe((quote as any).clientFirstName, ""),
      safe((quote as any).clientLastName, ""),
    ]
      .filter(Boolean)
      .join(" ");

  const address =
    (quote as any).clientAddress ??
    [
      safe((quote as any).clientStreet, ""),
      safe((quote as any).clientNumber, ""),
      safe((quote as any).clientCommune, ""),
    ]
      .filter(Boolean)
      .join(", ");

  // Totales en centavos (según tu models: subtotalCents + IVA_PERCENT)
  const netTotalCents = items.reduce(
    (acc, it) => acc + safe((it as any).subtotalCents, 0),
    0
  );
  const iva = safe(brand.IVA_PERCENT, 0);
  const ivaCents = Math.round((netTotalCents * iva) / 100);
  const grandTotalCents = netTotalCents + ivaCents;

  const quoteNumber = (quote as any).number ?? "—";
  const quoteDate = dateFromMillis((quote as any).dateMillis);

  return (
    <Document title={`Cotización ${quoteNumber}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandCard}>
            <View style={styles.logoWrap}>
              {logoSrc ? (
                <Image src={logoSrc} style={styles.logo} />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text>Sin logo</Text>
                </View>
              )}
            </View>

            {!!brand.COMPANY_NAME && <Text>{brand.COMPANY_NAME}</Text>}
            {!!brand.COMPANY_EMAIL && <Text>{brand.COMPANY_EMAIL}</Text>}
            {!!brand.COMPANY_PHONE && <Text>+56 {brand.COMPANY_PHONE}</Text>}
            {!!brand.COMPANY_ADDRESS && <Text>{brand.COMPANY_ADDRESS}</Text>}
            {!!brand.COMPANY_RUT && <Text>RUT: {brand.COMPANY_RUT}</Text>}
          </View>

          <View style={styles.quoteHeader}>
            <Text style={styles.quoteTitle}>Cotización</Text>
            <Text style={styles.quoteSubTitle}>{`#${quoteNumber}`}</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cliente</Text>
                <Text style={styles.infoValue}>{clientName || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{quoteDate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dirección</Text>
                <Text style={styles.infoValue}>{address || "N/A"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>
                  {safe((quote as any).clientEmail, "N/A")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items */}
        <Text style={styles.sectionTitle}>Detalle de ítems</Text>
        {items.map((it, idx) => {
          const imgSrc = imageForQuote(
            (it as any).type as ItemType,
            safe((it as any).options, {})
          );

          return (
            <View key={idx} style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.itemInfoSection}>
                  <Text style={styles.itemTitle}>
                    {(it as any).name || (it as any).type || "Ítem"}
                  </Text>

                  <View style={styles.itemGrid}>
                    {(it as any).width && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          Ancho: {(it as any).width} mm
                        </Text>
                      </View>
                    )}
                    {(it as any).height && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          Alto: {(it as any).height} mm
                        </Text>
                      </View>
                    )}
                    {(it as any).color && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          Color: {(it as any).color}
                        </Text>
                      </View>
                    )}
                    {(it as any).quantity && (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>
                          Cantidad: {(it as any).quantity}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.itemImageSection}>
                  {imgSrc ? (
                    <Image src={imgSrc} style={styles.itemImage} />
                  ) : (
                    <View
                      style={[
                        styles.itemImage,
                        {
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: COLORS.grayLight,
                        },
                      ]}
                    >
                      <Text>Sin imagen</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Resumen */}
        <Text style={styles.sectionTitle}>Resumen</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryHeader}>Totales</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Neto</Text>
            <Text style={styles.summaryValue}>{peso(netTotalCents)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>IVA ({iva}%)</Text>
            <Text style={styles.summaryValue}>{peso(ivaCents)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{peso(grandTotalCents)}</Text>
          </View>
        </View>

        {/* Condiciones (si existen en la marca) */}
        {!!brand.CONDITIONS?.length && (
          <>
            <Text style={styles.sectionTitle}>Condiciones</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: 10,
                gap: 6,
              }}
            >
              {brand.CONDITIONS.map((c, i) => (
                <Text key={i}>• {c}</Text>
              ))}
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {brand.COMPANY_NAME}
            {brand.COMPANY_EMAIL ? ` • ${brand.COMPANY_EMAIL}` : ""}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
