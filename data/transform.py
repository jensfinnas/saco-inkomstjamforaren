# encoding: utf-8

"""
Transform original data from Saco to format for visualization.
"""

import csvkit as csv
import json
from collections import defaultdict
from slugify import slugify
from copy import deepcopy

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

def parse_int(string):
    try:
        return int(float(string))
    except ValueError:
        return None

def srange(start, stop, step):
    """ Like range(), but with custom incrementation
    """
    r = start
    while r < stop:
        yield r
        r += step

def save_list_of_datasets(def_dict, folder, prefix, version):
    file_list = [] # A list of saved files for reference
    for key in def_dict:
        dataset = def_dict[key]
        profession = key.split(";")[0]
        publicprivate = key.split(";")[1]
        file_name = "{}/{}-{}-{}-{}.csv"\
            .format(folder, version, prefix, slugify(profession), publicprivate)
        #folder + "/" + prefix + slugify(profession) + "-" + publicprivate + ".csv"
        save_csv_file(file_name, dataset)
        file_list.append({ 
            "file_name": file_name, 
            "profession": profession,
            "publicprivate": publicprivate  
        })

    with open('{}-{}-file_list.json'.format(version, prefix), 'w') as outfile:
        json.dump(file_list, outfile)

def split_by_profession_and_publicprivate(dataset):
    grouped_data = defaultdict(list)
    for row in dataset:
        key = row["profession"] + ";" + row["publicprivate"]
        grouped_data[key].append(row)

    return grouped_data



def transform_percentile_dataset(dataset):
    _resp = []
    prev_income = ""
    for row in dataset:
        _row = {}
        try:
            _row["profession"] = row["Utbildning"]
        except KeyError:
            # Chefer har annan kolumnrubrik
            _row["profession"] = row["Befattning"]
        _row["publicprivate"] = "private" if "Privat" in row["Arbsektor"] else "public"
        _row["percentile"] = row["Andel"]
        _row["income"] = row["Lon"]
        if prev_income != _row["income"]:
            _resp.append(_row)
            prev_income = _row["income"]

    return _resp

def transform_incomegroup_dataset(dataset):
    _resp = []
    for row in dataset:
        _row = {}
        try:
            _row["profession"] = row["Utbildning"]
        except:
            _row["profession"] = row["Befattning"]
        _row["publicprivate"] = "private" if "Privat" in row["Arbsektor"] else "public"
        _row["income"] = row[u"Lön"].replace(" ","")
        if ">=" in _row["income"]:
            _row["income"] = _row["income"].replace(">=","") + "-"

        # Transform the first bin (<25000) to 24999
        if "<" in _row["income"]:
            income_upper = parse_int(_row["income"].split("<")[1]) - 1
            _row["income"] = "-%s" % income_upper            
        _row["value"] = float(row["Andel"].replace(",",".")) / 100
        _resp.append(_row)

    return _resp

def fill_empty_bins(grouped_data):
    """ Some datasets miss income groups if value is 0
        This function fills those holes
    """
    for key, dataset in grouped_data.iteritems():
        existing_incomegroups = [parse_int(row["income"].split("-")[0]) for row in dataset]
        incomegroups = [x for x in srange(existing_incomegroups[1],existing_incomegroups[-1],1000)]
        missing = list(set(incomegroups) - set(existing_incomegroups[1:-1]))
        for income_lower in missing:
            row = deepcopy(dataset[0])
            row["value"] = 0.0
            row["income"] = "%s-%s" % (income_lower, income_lower+999)
            dataset.append(row)
    return grouped_data

def sort_datasets(grouped_data):
    for key, dataset in grouped_data.iteritems():
        grouped_data[key] = sorted(dataset, key=lambda k: k['income'])

    return grouped_data

def prepare_percentile_data(original_file, version):
    """
    :param original_file: "XXXX - tusental.csv"
    :param version: employee|manager
    """
    percentile_dataset = open_csv_file(original_file)
    percentile_dataset = transform_percentile_dataset(percentile_dataset)
    percentile_dataset = split_by_profession_and_publicprivate(percentile_dataset)
    save_list_of_datasets(percentile_dataset, "by_profession", "percentile", version)    

def prepare_incomegroup_data(original_file, version):
    """
    :param original_file: "XXXX - tusental.csv"
    :param version: employee|manager
    """
    incomegroup_dataset = open_csv_file(original_file)
    incomegroup_dataset = transform_incomegroup_dataset(incomegroup_dataset)
    incomegroup_dataset = split_by_profession_and_publicprivate(incomegroup_dataset)
    incomegroup_dataset = fill_empty_bins(incomegroup_dataset)
    incomegroup_dataset = sort_datasets(incomegroup_dataset)
    save_list_of_datasets(incomegroup_dataset, "by_profession", "incomegroup", version)    


prepare_percentile_data("original/170223 - percentile_data.csv", "employee")
prepare_incomegroup_data("original/170223 - tusental.csv", "employee")
prepare_percentile_data("original/170223 - percentiler - chefer.csv", "manager")
prepare_incomegroup_data("original/170223 - tusental - chefer.csv", "manager")

