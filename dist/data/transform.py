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
    for key in def_dict:
        dataset = def_dict[key]
        profession = key.split(";")[0]
        publicprivate = key.split(";")[1]
        file_name = folder + "/" + prefix + slugify(profession) + "-" + publicprivate + ".csv"
        save_csv_file(file_name, dataset)
        file_list.append({ 
            "file_name": file_name, 
            "profession": profession,
            "publicprivate": publicprivate  
        })

    with open(prefix + 'file_list.json', 'w') as outfile:
        json.dump(file_list, outfile)

def split_by_profession_and_publicprivate(dataset):
    grouped_data = defaultdict(list)
    for row in dataset:
        key = row["profession"] + ";" + row["publicprivate"]
        grouped_data[key].append(row)

    return grouped_data



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

def transform_incomegroup_dataset(dataset):
    _resp = []
    for row in dataset:
        _row = {}
        _row["profession"] = row["Utbildning"]
        _row["publicprivate"] = "private" if row["Arbsektor"] == "Privat" else "public"
        _row["income"] = row[u"Lön"].replace(" ","").replace("<","-")
        if ">=" in _row["income"]:
            _row["income"] = _row["income"].replace(">=","") + "-"
        _row["value"] = float(row["Andel"].replace(",",".")) / 100
        _resp.append(_row)

    return _resp


def prepare_percentile_data(original_file):
    percentile_dataset = open_csv_file(original_file)
    percentile_dataset = transform_percentile_dataset(percentile_dataset)
    percentile_dataset = split_by_profession_and_publicprivate(percentile_dataset)
    save_list_of_datasets(percentile_dataset, "by_profession", "percentile-")    

def prepare_incomegroup_data(original_file):
    incomegroup_dataset = open_csv_file(original_file)
    incomegroup_dataset = transform_incomegroup_dataset(incomegroup_dataset)
    incomegroup_dataset = split_by_profession_and_publicprivate(incomegroup_dataset)
    save_list_of_datasets(incomegroup_dataset, "by_profession", "incomegroup-")    


prepare_percentile_data("original/160129 - percentile_data.csv")
prepare_incomegroup_data("original/160129 - tusental.csv")