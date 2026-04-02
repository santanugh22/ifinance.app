// utils/ExportService.ts

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Transaction } from '@/types';
import { CURRENCIES } from '@/store/useSettingsStore';

export class ExportService {
  /**
   * Exports an array of transactions to a CSV file and opens the system share sheet.
   */
  static async exportTransactionsToCSV(transactions: Transaction[], currencyCode: string = 'USD') {
    if (transactions.length === 0) {
      throw new Error('No transactions to export');
    }

    const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
    
    // CSV Header
    let csvContent = 'Date,Type,Category,Amount,Currency,Notes\n';

    // CSV Rows
    transactions.forEach((tx) => {
      const date = new Date(tx.date).toLocaleDateString();
      const type = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
      const amount = tx.amount.toFixed(2);
      const notes = tx.notes ? `"${tx.notes.replace(/"/g, '""')}"` : '';
      
      csvContent += `${date},${type},${tx.categoryId},${amount},${currency.code},${notes}\n`;
    });

    const fileName = `IFinance_Export_${new Date().getTime()}.csv`;
    // Using any cast to bypass persistent SDK 54 / RN 0.81 typing issues with Expo FileSystem
    const docDir = (FileSystem as any).documentDirectory || (FileSystem as any).Paths?.document;
    const filePath = `${docDir}${fileName}`;

    try {
      // Write the file
      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: (FileSystem as any).EncodingType?.UTF8 || 'utf8',
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Transactions',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
}
