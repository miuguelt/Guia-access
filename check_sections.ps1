$lines = Get-Content "c:\Users\Miguel\Documents\GitHub\Guia access\index.html"
$depth = 0
$results = New-Object System.Collections.Generic.List[string]
$targets = @("gs-crear-bd", "gs-crear-tabla", "gs-rel-1n", "gs-modificar-tabla", "gs-tables", "gs-formularios")
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $opens = ([regex]::Matches($line, "<div(\s|>)")).Count
    $closes = ([regex]::Matches($line, "</div>")).Count
    $depthBefore = $depth
    $depth += $opens - $closes
    foreach ($t in $targets) {
        if ($line -like "*id=`"$t`"*") {
            $results.Add("Line $($i+1): id=$t, DepthBefore=$depthBefore, DepthAfter=$depth")
        }
    }
}
$results | Out-File -FilePath "sections_depth.txt"
