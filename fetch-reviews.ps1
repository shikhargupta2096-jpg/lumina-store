param (
    [string]$ApiKey = ""
)

if ($ApiKey -eq "") {
    Write-Host "Error: Please provide your API Key." -ForegroundColor Red
    Write-Host "Usage: .\fetch-reviews.ps1 -ApiKey 'AIza...'"
    exit 1
}

# The Lumina Store Place ID
$PlaceId = "ChIJnTSSS3U1nzkRxrINf2zE658"

# Google Places API (New) Endpoint
$Url = "https://places.googleapis.com/v1/places/$PlaceId"

# Request Headers
$Headers = @{
    "X-Goog-Api-Key" = $ApiKey
    "X-Goog-FieldMask" = "rating,userRatingCount,reviews"
    "Content-Type" = "application/json"
}

Write-Host "Fetching Google Reviews for Lumina..." -ForegroundColor Cyan

try {
    # Call the API
    $Response = Invoke-RestMethod -Uri $Url -Method Get -Headers $Headers -ErrorAction Stop

    # Extract Data
    $Rating = if ($Response.rating) { $Response.rating } else { 0 }
    $TotalCount = if ($Response.userRatingCount) { $Response.userRatingCount } else { 0 }
    
    $FormattedReviews = @()

    if ($Response.reviews -and $Response.reviews.Count -gt 0) {
        foreach ($Review in $Response.reviews) {
            $FormattedReviews += @{
                "author" = $Review.authorAttribution.displayName
                "photo_url" = $Review.authorAttribution.photoUri
                "rating" = $Review.rating
                "text" = $Review.text.text
                "date" = $Review.relativePublishTimeDescription
            }
        }
    }

    # Prepare JSON output
    $OutputData = @{
        "overall_rating" = $Rating
        "total_reviews" = $TotalCount
        "fetched_at" = (Get-Date -Format "yyyy-MM-dd HH:mm")
        "reviews" = $FormattedReviews
    }

    # Save to JSON
    $JsonString = $OutputData | ConvertTo-Json -Depth 5 -Compress
    
    # Save as UTF-8 without BOM
    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText("$PSScriptRoot\reviews.json", $JsonString, $Utf8NoBomEncoding)

    Write-Host "Success! Saved $TotalCount ratings and $($FormattedReviews.Count) text reviews to reviews.json." -ForegroundColor Green

} catch {
    Write-Host "Failed to fetch reviews." -ForegroundColor Red
    Write-Host $_.Exception.Message
}
