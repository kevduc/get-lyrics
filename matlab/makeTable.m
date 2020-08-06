dataFolder = "../data";
files = dir(dataFolder + "/*.json");
files = dataFolder + "/" + string({files.name});

for i = 1:size(files,2)
    file = files(i);
    text = fileread(file);
    json = jsondecode(text);
    disp(json);
end