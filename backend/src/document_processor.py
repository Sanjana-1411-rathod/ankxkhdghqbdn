import os
import pandas as pd
from typing import List


class DocumentProcessor:
    """
    Processes CSV, Excel, PDF, TXT files into text chunks for the vector store.
    Optimised for ANKAN Garments sales and stock data.
    """

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def process_file(self, file_path: str) -> List[str]:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".csv":
            return self._process_csv(file_path)
        elif ext in [".xlsx", ".xls"]:
            return self._process_excel(file_path)
        elif ext == ".pdf":
            return self._process_pdf(file_path)
        elif ext == ".txt":
            return self._process_txt(file_path)
        return []

    def _process_csv(self, file_path: str) -> List[str]:
        chunks = []
        filename = os.path.basename(file_path)

        for enc in ["utf-8", "latin-1", "cp1252"]:
            try:
                df = pd.read_csv(file_path, encoding=enc, low_memory=False)
                break
            except Exception:
                continue
        else:
            return [f"Error reading {filename}"]

        df.columns = [str(c).strip() for c in df.columns]
        fname_lower = filename.lower()

        # ── SALES ────────────────────────────────────────────────────────────
        if any(k in fname_lower for k in ["sale", "sales"]):
            lines = [f"FILE: {filename} | SALES DATA | {len(df)} records",
                     f"Columns: {', '.join(df.columns.tolist())}"]

            if "Net Amount" in df.columns:
                total = pd.to_numeric(df["Net Amount"], errors="coerce").sum()
                lines.append(f"Total Revenue: ₹{total:,.2f}")

            for col, label in [("Brand", "Top Brands"), ("Marketing Group", "Groups"), ("Size", "Sizes")]:
                if col in df.columns:
                    vc = df[col].value_counts().head(10)
                    lines.append(f"{label}: " + ", ".join(f"{k}({v})" for k, v in vc.items()))

            if "Qty" in df.columns:
                lines.append(f"Total Qty Sold: {pd.to_numeric(df['Qty'], errors='coerce').sum():,.0f}")

            chunks.append("\n".join(lines))
            chunks.extend(self._batch_rows(df, "SALES", 25))

        # ── STOCK ────────────────────────────────────────────────────────────
        elif any(k in fname_lower for k in ["stock", "inventory", "detail"]):
            lines = [f"FILE: {filename} | STOCK DATA | {len(df)} records",
                     f"Columns: {', '.join(df.columns.tolist())}"]

            qty_col = next((c for c in df.columns if "qty" in c.lower() or "stock" in c.lower()), None)
            if qty_col:
                df[qty_col] = pd.to_numeric(df[qty_col], errors="coerce")
                lines.append(f"Total Stock Units: {df[qty_col].sum():,.0f}")
                low = df[df[qty_col] <= 5]
                lines.append(f"Low Stock Items (qty ≤ 5): {len(low)} SKUs")
                if len(low):
                    show_cols = [c for c in ["Article", "Brand", "Description", qty_col] if c in df.columns]
                    lines.append("Sample Low Stock:\n" + low[show_cols].head(20).to_string(index=False))

            for col, label in [("Brand", "Brands in Stock"), ("Marketing Group", "Stock Groups")]:
                if col in df.columns:
                    vc = df[col].value_counts().head(10)
                    lines.append(f"{label}: " + ", ".join(f"{k}({v})" for k, v in vc.items()))

            chunks.append("\n".join(lines))
            chunks.extend(self._batch_rows(df, "STOCK", 25))

        # ── GENERIC ──────────────────────────────────────────────────────────
        else:
            chunks.append(f"FILE: {filename} | {len(df)} rows | Columns: {', '.join(df.columns.tolist())}")
            chunks.extend(self._batch_rows(df, "DATA", 25))

        return chunks

    def _batch_rows(self, df: pd.DataFrame, label: str, batch: int) -> List[str]:
        chunks = []
        rows = []
        for i, row in df.iterrows():
            text = " | ".join(f"{c}: {v}" for c, v in row.items() if pd.notna(v) and str(v).strip())
            rows.append(text)
            if len(rows) >= batch:
                start = i - batch + 1
                chunks.append(f"{label} RECORDS (rows {start}-{i}):\n" + "\n".join(rows))
                rows = []
        if rows:
            chunks.append(f"{label} RECORDS (remaining):\n" + "\n".join(rows))
        return chunks

    def _process_excel(self, file_path: str) -> List[str]:
        chunks = []
        xl = pd.ExcelFile(file_path)
        for sheet in xl.sheet_names:
            df = xl.parse(sheet)
            tmp = f"/tmp/{os.path.basename(file_path)}_{sheet}.csv"
            df.to_csv(tmp, index=False)
            chunks.extend(self._process_csv(tmp))
        return chunks

    def _process_pdf(self, file_path: str) -> List[str]:
        try:
            import pdfplumber
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += (page.extract_text() or "") + "\n"
            return self._split_text(text)
        except ImportError:
            return ["PDF processing requires pdfplumber: pip install pdfplumber"]

    def _process_txt(self, file_path: str) -> List[str]:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return self._split_text(f.read())

    def _split_text(self, text: str) -> List[str]:
        words = text.split()
        step = self.chunk_size - self.chunk_overlap
        return [
            " ".join(words[i: i + self.chunk_size])
            for i in range(0, len(words), step)
            if " ".join(words[i: i + self.chunk_size]).strip()
        ]
