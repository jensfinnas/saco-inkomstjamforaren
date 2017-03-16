# encoding: utf-8

"""
This script will iterate all files in folder with original production
data, split it into smaller datafiles and generate a config file
that lists all available associations and datasets.
"""

import glob
import csvkit as csv
import json
from collections import defaultdict
from slugify import slugify
from copy import deepcopy

# Where to get source data
FILES_DIR = "original-production"

# Where to store prepared data
DATA_FOLDER = "prepared-data"

DATESET_LISTS_FILE = "dataset_lists.json"

ALLOWED_ASSOCIATIONS = ["saco", "ssr"]
ALLOWED_EMPLOYMENTS = ["manager", "employee"]

PERCENTILE_FILE_KEY = "percentile" # "Percentiler"
INCOMEGROUPS_FILE_KEY = "incomegroups" # "Tusental"

ALLOWED_FILE_KEYS = [PERCENTILE_FILE_KEY, INCOMEGROUPS_FILE_KEY]

def validate_filename(filename):
    """ Make sure that the file name consists of valid association, employment status and file key
    """
    association, employment, filekey = filename.split("-")
    filekey = filekey.replace(".csv","")
    assert association in ALLOWED_ASSOCIATIONS, u"{} is not an allowed association, try: {}".format(association, ALLOWED_ASSOCIATIONS)
    assert employment in ALLOWED_EMPLOYMENTS,  u"{} is not an allowed employment, try: {}".format(association, ALLOWED_EMPLOYMENTS)
    assert filekey in ALLOWED_FILE_KEYS,  u"{} is not an allowed employment, try: {}".format(filekey, ALLOWED_FILE_KEYS)


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

def save_list_of_datasets(def_dict, filekey, employment):
    file_list = [] # A list of saved files for reference
    for key in def_dict:
        dataset = def_dict[key]
        profession = key.split(";")[0]
        publicprivate = key.split(";")[1]
        file_name = "{}/{}-{}-{}-{}.csv"\
            .format(DATA_FOLDER, employment, filekey, slugify(profession), publicprivate)
        #folder + "/" + prefix + slugify(profession) + "-" + publicprivate + ".csv"
        save_csv_file(file_name, dataset)
        file_list.append({ 
            "file_name": file_name, 
            "profession": profession,
            "publicprivate": publicprivate  
        })
    return file_list

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

try:
    with open(DATESET_LISTS_FILE) as f:
        dataset_lists = json.load(f)
except (IOError, ValueError):
    dataset_lists = {}

for filepath in glob.iglob(FILES_DIR + "/*.csv"):
    filename = filepath.split("/")[-1]
    
    # Validate file name
    validate_filename(filename)
    
    # Get association, employment status and filekey 
    association, employment, filekey = filename.split("-")
    filekey = filekey.replace(".csv","")
    
    # Open
    dataset = open_csv_file(filepath)
    
    if filekey == PERCENTILE_FILE_KEY:
        dataset = transform_percentile_dataset(dataset)
        dataset = split_by_profession_and_publicprivate(dataset)
    else:
        dataset = transform_incomegroup_dataset(dataset)
        dataset = split_by_profession_and_publicprivate(dataset)
        dataset = fill_empty_bins(dataset)
        dataset = sort_datasets(dataset)
    
    file_list = save_list_of_datasets(dataset, filekey, employment) 
    
    if association not in dataset_lists:
        dataset_lists[association] = {}
    
    if employment not in dataset_lists[association]:
        dataset_lists[association][employment] = {}
    
    dataset_lists[association][employment]["association"] = association
    dataset_lists[association][employment]["file_list"] = file_list
        

    with open(DATESET_LISTS_FILE, 'w') as f:
        json.dump(dataset_lists, f, indent=4)     