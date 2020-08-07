function [tableTotal, tableTotalStacked] = makeTable(dataFile)
if nargin == 0
    dataFile = "../data-compiled.json";
end

% t = table('Size', [0 4], 'VariableTypes', ["string","string","string","string"], 'VariableNames', ["arabic", "arabicIDs", "english", "englishIDs"]);

text = fileread(dataFile);
data = jsondecode(text);
data.arabic = string(data.arabic);
data.english = string(data.english);
% data.translationNum = "english"+string(data.translationNum);

tableTotalStacked = sortrows(unique(struct2table(data)), "arabic");

g = findgroups(tableTotalStacked.arabic);
d = [0; diff(g) == 0];
for i = 2:size(d,1)
    if (d(i) > 0)
        d(i) = d(i-1) + d(i);
    end
end

tableTotal = [tableTotalStacked, table("english"+d, 'VariableNames', "translationNum")];
tableTotal = unstack(tableTotal, "english", "translationNum");
