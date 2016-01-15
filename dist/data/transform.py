# encoding: utf-8

"""
Transform original data from Saco to format for visualization.
"""

import csvkit as csv
import json
from collections import defaultdict
from slugify import slugify

def open_csv_file(file_path):
    with open(file_path) as csvfile:
        reader = csv.DictReader(csvfile)
        return [row for row in reader]

def save_csv_file(file_name, dataset):
    print "Save %s" % file_name
    with open(file_name, 'w') as csvfile:
        fieldnames = dataset[0].keys()
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for row in dataset:
            writer.writerow(row)

def save_list_of_datasets(def_dict, folder, prefix):
    file_list = [] # A list of saved files for reference
    for profession in def_dict:
        dataset = def_dict[profession]
        file_name = folder + "/" + prefix + slugify(profession) + ".csv"
        save_csv_file(file_name, dataset)
        file_list.append({ "file_name": file_name, "profession": profession })

    with open(prefix + 'file_list.json', 'w') as outfile:
        json.dump(file_list, outfile)

def split_by_profession(dataset):
    data_by_profession = defaultdict(list)
    for row in dataset:
        data_by_profession[row["profession"]].append(row)

    return data_by_profession

def transform_percentile_dataset(dataset):
    _resp = []
    for row in dataset:
        _row = {}
        _row["profession"] = row["Utbildning"]
        _row["publicprivate"] = "private" if row["Arbsektor"] == "Privat" else "public"
        _row["percentile"] = row["Andel"]
        _row["income"] = row["Lon"]
        _resp.append(_row)

    return _resp


def prepare_percentile_data(original_file):
    percentile_dataset = open_csv_file(original_file)
    percentile_dataset = transform_percentile_dataset(percentile_dataset)
    percentile_dataset = split_by_profession(percentile_dataset)
    save_list_of_datasets(percentile_dataset, "by_profession", "percentile-")    


prepare_percentile_data("original/percentile_data.csv")