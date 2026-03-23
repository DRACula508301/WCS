import pandas as pd
import os
import argparse

# Read in the command line arguments
parser = argparse.ArgumentParser(description='Convert XLSX files to CSV format.')
parser.add_argument('--folder_path', type=str, help='The path to the folder containing the XLSX files.')
args = parser.parse_args()


def folder_xlsx_to_csv(folder_path):
    if not folder_path:
        raise ValueError("Please provide --folder_path")

    folder_path = os.path.abspath(folder_path)
    output_folder_path = os.path.join(os.path.dirname(folder_path), "csv_output")
    os.makedirs(output_folder_path, exist_ok=True)

    for dirpath, _, filenames in os.walk(folder_path):
        for filename in filenames:
            if filename.endswith(".xlsx"):
                xlsx_file = os.path.join(dirpath, filename)
                rel_dir = os.path.relpath(dirpath, folder_path)
                curr_csv_folder = output_folder_path if rel_dir == "." else os.path.join(output_folder_path, rel_dir)
                os.makedirs(curr_csv_folder, exist_ok=True)
                csv_file = os.path.join(curr_csv_folder, filename.replace(".xlsx", ".csv"))
                df = pd.read_excel(xlsx_file)
                df.to_csv(csv_file, index=False)

if __name__ == "__main__":
    folder_xlsx_to_csv(args.folder_path)