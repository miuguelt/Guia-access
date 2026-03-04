$lines = Get-Content "c:\Users\Miguel\Documents\GitHub\Guia access\index.html"
$depth = 0
$results = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $opens = ([regex]::Matches($line, "<div(\s|>)")).Count
    $closes = ([regex]::Matches($line, "</div>")).Count
    $depthBefore = $depth
    $depth += $opens - $closes
    if ($line -like "*m1-practica*" -or $line -like "*m1-entregables*" -or $line -like "*m1-avanzado*" -or $line -like "*m1-quiz*") {
        $results.Add("Line $($i+1): DepthBefore=$depthBefore, DepthAfter=$depth, Opens=$opens, Closes=$closes, Line=`"$($line.Trim())`"")
    }
}
$results | Out-File -FilePath "depth_check.txt"
