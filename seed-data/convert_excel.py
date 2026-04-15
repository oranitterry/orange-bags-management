import pandas as pd
import json
import os
import math

EXCEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'חלוקת שקיות כתומות עיריית ערד.xlsx')
OUTPUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'addresses.json')

def clean_value(val, default=0):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return default
    return val

def convert():
    print(f'קורא קובץ: {EXCEL_PATH}')
    df = pd.read_excel(EXCEL_PATH)
    df = df.iloc[:, :7]
    df.columns = ['areaName', 'propertyAddress', 'houseNumber', 'apartmentNumber', 'fullAddress', 'report', 'propertyNumber']
    df = df[['areaName', 'propertyAddress', 'houseNumber', 'apartmentNumber', 'fullAddress', 'propertyNumber']]

    records = []
    for _, row in df.iterrows():
        records.append({
            'areaName': str(row['areaName']) if pd.notna(row['areaName']) else '',
            'propertyAddress': str(row['propertyAddress']) if pd.notna(row['propertyAddress']) else '',
            'houseNumber': int(row['houseNumber']) if pd.notna(row['houseNumber']) else 0,
            'apartmentNumber': int(row['apartmentNumber']) if pd.notna(row['apartmentNumber']) else 0,
            'fullAddress': str(row['fullAddress']) if pd.notna(row['fullAddress']) else '',
            'propertyNumber': int(row['propertyNumber']) if pd.notna(row['propertyNumber']) else 0,
        })

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f'✅ יוצאו {len(records)} כתובות')

if __name__ == '__main__':
    convert()
