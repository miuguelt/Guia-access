$lines = Get-Content "c:\Users\Miguel\Documents\GitHub\Guia access\index.html"
$depth = 0
$results = New-Object System.Collections.Generic.List[string]
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $opens = ([regex]::Matches($line, "<div(\s|>)")).Count
    $closes = ([regex]::Matches($line, "</div>")).Count
    $depth += $opens - $closes
    $results.Add("$($i+1): Depth=$depth, Text=$($line.Trim())")
}
$results | Out-File -FilePath "full_depth_check.txt"
