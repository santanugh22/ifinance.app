// components/investments/StockTicker.tsx

import { useThemeColor } from "@/hooks/useThemeColor";
import { MarketService } from "@/services/MarketService";
import { MarketHighlight } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export function StockTicker() {
  const [highlights, setHighlights] = useState<MarketHighlight[]>([]);
  const colors = useThemeColor();

  useEffect(() => {
    const fetch = async () => {
      const data = await MarketService.getMarketHighlights();
      setHighlights(data);
    };
    fetch();
  }, []);

  if (highlights.length === 0) return null;

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {highlights.map((item, index) => (
          <View key={item.symbol} style={styles.tickerItem}>
            <Text style={[styles.name, { color: colors.textSecondary }]}>
              {item.name}
            </Text>
            <Text style={[styles.symbol, { color: colors.tabIconDefault }]}>
              {item.symbol}
            </Text>
            <Text style={[styles.price, { color: colors.text }]}>
              {item.price}
            </Text>
            <View style={styles.changeContainer}>
              <Ionicons
                name={item.isUp ? "caret-up" : "caret-down"}
                size={12}
                color={item.isUp ? colors.success : colors.danger}
              />
              <Text
                style={[
                  styles.change,
                  { color: item.isUp ? colors.success : colors.danger },
                ]}
              >
                {item.change}
              </Text>
            </View>
            {index < highlights.length - 1 && (
              <View
                style={[styles.separator, { backgroundColor: colors.border }]}
              />
            )}
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderBottomWidth: 1,
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  tickerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  name: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    marginRight: 8,
  },
  symbol: {
    fontSize: 9,
    fontWeight: "700",
    marginRight: 6,
    textTransform: "uppercase",
  },
  price: {
    fontSize: 11,
    fontWeight: "700",
    marginRight: 6,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  change: {
    fontSize: 10,
    fontWeight: "800",
  },
  separator: {
    width: 1,
    height: 14,
    marginLeft: 20,
  },
});
