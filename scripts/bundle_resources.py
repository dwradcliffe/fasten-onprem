import json
import glob
import sys
import os
import re

# Step 1: Load all FHIR resources from individual JSON files
resources = []

if len(sys.argv) < 2:
    print("Please provide the folder path as a command line argument.")
    sys.exit(1)
if len(sys.argv) < 3:
    print("Please provide both input folder path and output file path as command line arguments.")
    sys.exit(1)

folder_path = sys.argv[1]

def escape_rtf(rtf_content):
    # Escape backslashes and double quotes
    escaped = rtf_content.replace('\\', '\\\\').replace('"', '\\"')
    # Replace newlines with \\n
    escaped = escaped.replace('\r', '\\r').replace('\n', '\\n')
    return escaped

def load_json_safely(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

        # Find and escape RTF content
        def replace_rtf(match):
            rtf = match.group(1)
            escaped_rtf = escape_rtf(rtf)
            return f'"text": "{escaped_rtf}"'

        content = re.sub(r'"text"\s*:\s*"(\\{[^}]+}[^"]*)"', replace_rtf, content, flags=re.DOTALL)

        # Parse JSON
        return json.loads(content)

for filename in glob.glob(os.path.join(folder_path, "*.json")):
    try:
        print(f"Loading {filename}")
        resource = load_json_safely(filename)
        resources.append(resource)
    except json.JSONDecodeError as e:
        print(f"Error loading {filename}: {e}")
        print("Skipping this file and continuing...")

# Step 2: Create a FHIR Bundle structure
bundle = {
    "resourceType": "Bundle",
    "type": "collection",  # or another type, depending on your use case
    "entry": []
}

# Step 3: Add resources to the bundle
for resource in resources:
    bundle['entry'].append({"resource": resource})

# Step 4: Save the bundle to a JSON file
output_file = sys.argv[2]

with open(output_file, 'w') as bundle_file:
    json.dump(bundle, bundle_file, indent=2)

print(f"Bundle saved to {output_file}")
