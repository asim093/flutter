import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:velocity_x/velocity_x.dart';

class Attraction extends StatefulWidget {
  final String? cityName;
  final String? categoryName;
  final String? categoryId;

  const Attraction({Key? key, this.cityName, this.categoryName, this.categoryId})
    : assert(
        cityName != null || categoryName != null || categoryId != null,
        'At least one of cityName, categoryName, or categoryId must be provided',
      ),
      super(key: key);

  @override
  State<Attraction> createState() => _AttractionState();
}

class _AttractionState extends State<Attraction>
    with SingleTickerProviderStateMixin {
  List<Map<String, dynamic>> attractions = [];
  bool isLoading = true;
  bool hasError = false;
  String errorMessage = '';
  late AnimationController _animationController;
  late Animation<double> _opacityAnimation;
  String searchQuery = '';

  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
    );

    _animationController.forward();
    fetchAttractions();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Map<String, String> _getQueryParams() {
    final Map<String, String> params = {};

    if (widget.cityName != null) {
      params['cityName'] = widget.cityName!;
    }

    if (widget.categoryName != null) {
      params['categoryName'] = widget.categoryName!;
    }

    if (widget.categoryId != null) {
      params['categoryId'] = widget.categoryId!;
    }

    return params;
  }

  Future<void> fetchAttractions() async {
    setState(() {
      isLoading = true;
      hasError = false;
      errorMessage = '';
    });

    final params = _getQueryParams();
    final queryString = params.entries
        .map(
          (e) =>
              '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}',
        )
        .join('&');

    final String url = 'http://localhost:5000/api/user/attraction?$queryString';

    

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
       

        final data = jsonDecode(response.body);

        final List attractionList =
            data is List
                ? data
                : (data['attractions'] is List ? data['attractions'] : []);


        setState(() {
          attractions =
              attractionList.map<Map<String, dynamic>>((item) {
                final imageUrl = item['image'] ?? '';
                if (imageUrl.isNotEmpty) {
                } else {
                  print(
                    "⚠️ Missing image URL for attraction: ${item['name'] ?? 'unknown'}",
                  );
                }

                // Extract address components safely
                final address = item['address'] ?? {};
                final String fullAddress = [
                      address['street'],
                      address['area'],
                      address['city'],
                      address['state'],
                      address['country'],
                    ]
                    .where(
                      (element) =>
                          element != null && element.toString().isNotEmpty,
                    )
                    .join(', ');

                // Calculate distance if available
                String distance = '';
                if (item['location'] != null &&
                    item['location']['coordinates'] != null &&
                    item['location']['coordinates'] is List &&
                    item['location']['coordinates'].length >= 2) {
                  // If you have user's location, you could calculate actual distance
                  // For now, just use a placeholder or mock distance
                  final randomDistance = (1 + item.hashCode % 9) / 1.8;
                  distance = '${randomDistance.toStringAsFixed(1)} km';
                }

                return {
                  'id': item['_id'] ?? '',
                  'name': item['name'] ?? '',
                  'description': item['description'] ?? '',
                  'image': imageUrl,
                  'address': fullAddress,
                  'rating':
                      item['rating'] ??
                      (3.5 +
                          (item.hashCode % 20) /
                              10), // Mock rating if not available
                  'distance': distance,
                  'phone': item['phone'] ?? '',
                  'website': item['website'] ?? '',
                  'openingHours': item['openingHours'] ?? '',
                };
              }).toList();
          isLoading = false;
        });
      } else {
        print("❌ Failed to fetch data. Status code: ${response.statusCode}");
        print("❌ Response body: ${response.body}");
        setState(() {
          isLoading = false;
          hasError = true;
          errorMessage = "Server error: ${response.statusCode}";
        });
      }
    } catch (e) {
      print("❌ Error fetching attractions: $e");
      setState(() {
        isLoading = false;
        hasError = true;
        errorMessage = e.toString();
      });
    }
  }

  // Helper function to limit string length
  int min(int a, int b) => a < b ? a : b;

  // Filter attractions based on search query
  List<Map<String, dynamic>> get filteredAttractions {
    if (searchQuery.isEmpty) return attractions;

    return attractions.where((attraction) {
      final name = attraction['name']?.toString().toLowerCase() ?? '';
      final address = attraction['address']?.toString().toLowerCase() ?? '';
      final query = searchQuery.toLowerCase();

      return name.contains(query) || address.contains(query);
    }).toList();
  }

  // Image widget with enhanced error handling
  Widget networkImageWithErrorHandling(
    String? imageUrl, {
    double? width,
    double? height,
    BoxFit fit = BoxFit.cover,
    Widget? placeholder,
    Widget? errorWidget,
  }) {
    if (imageUrl == null || imageUrl.isEmpty) {
      return errorWidget ??
          Container(
            color: Colors.grey[800],
            child: const Icon(Icons.image, color: Colors.white60, size: 42),
          );
    }

    return Image.network(
      imageUrl,
      width: width,
      height: height,
      fit: fit,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return placeholder ??
            Center(
              child: CircularProgressIndicator(
                value:
                    loadingProgress.expectedTotalBytes != null
                        ? loadingProgress.cumulativeBytesLoaded /
                            loadingProgress.expectedTotalBytes!
                        : null,
                color: Colors.pinkAccent,
              ),
            );
      },
      errorBuilder: (context, error, stackTrace) {
        print("🖼️ Image error: $error for URL: $imageUrl");
        return errorWidget ??
            Container(
              color: Colors.grey[800],
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.broken_image, color: Colors.white60, size: 32),
                  SizedBox(height: 4),
                  Text(
                    'Image Error',
                    style: TextStyle(color: Colors.white60, fontSize: 10),
                  ),
                ],
              ),
            );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final String title =
        widget.categoryName ?? widget.cityName ?? 'Attractions';

    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: AnimatedBuilder(
          animation: _animationController,
          builder: (context, child) {
            return Opacity(
              opacity: _opacityAnimation.value,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Search Bar and Back Button
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 12,
                    ),
                    color: Colors.orange,
                    child: Row(
                      children: [
                        GestureDetector(
                          onTap: () => Navigator.pop(context),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.black12,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Icon(Icons.search, color: Colors.white),
                          ),
                        ),
                        SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            onChanged: (value) {
                              setState(() {
                                searchQuery = value;
                              });
                            },
                            style: TextStyle(color: Colors.white),
                            decoration: InputDecoration(
                              hintText:
                                  widget.categoryName != null
                                      ? 'Search ${widget.categoryName}'
                                      : 'Search $title',
                              hintStyle: TextStyle(color: Colors.white70),
                              border: InputBorder.none,
                              isDense: true,
                              contentPadding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                        SizedBox(width: 12),
                        GestureDetector(
                          onTap: () {
                            _searchController.clear();
                            setState(() {
                              searchQuery = '';
                            });
                          },
                          child: Icon(Icons.close, color: Colors.white),
                        ),
                      ],
                    ),
                  ),

                  // Attractions List
                  Expanded(
                    child:
                        isLoading
                            ? Center(
                              child: CircularProgressIndicator(
                                color: Colors.orange,
                              ),
                            )
                            : hasError
                            ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.error_outline,
                                    size: 64,
                                    color: Colors.redAccent,
                                  ),
                                  SizedBox(height: 16),
                                  Text(
                                    'Error loading attractions',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  SizedBox(height: 8),
                                  Padding(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: 32,
                                    ),
                                    child: Text(
                                      errorMessage,
                                      style: TextStyle(
                                        color: Colors.white70,
                                        fontSize: 14,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                  SizedBox(height: 16),
                                  ElevatedButton(
                                    onPressed: () => fetchAttractions(),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.orange,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                    ),
                                    child: Text('Try Again'),
                                  ),
                                ],
                              ),
                            )
                            : filteredAttractions.isEmpty
                            ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.location_off,
                                    size: 64,
                                    color: Colors.grey,
                                  ),
                                  SizedBox(height: 16),
                                  Text(
                                    'No attractions found',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 18,
                                    ),
                                  ),
                                  if (searchQuery.isNotEmpty) ...[
                                    SizedBox(height: 8),
                                    Text(
                                      'Try a different search term',
                                      style: TextStyle(
                                        color: Colors.white60,
                                        fontSize: 14,
                                      ),
                                    ),
                                    SizedBox(height: 12),
                                    ElevatedButton(
                                      onPressed: () {
                                        _searchController.clear();
                                        setState(() {
                                          searchQuery = '';
                                        });
                                      },
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.orange,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: Text('Clear Search'),
                                    ),
                                  ] else ...[
                                    SizedBox(height: 8),
                                    ElevatedButton(
                                      onPressed: () => fetchAttractions(),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.orange,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: Text('Refresh'),
                                    ),
                                  ],
                                ],
                              ),
                            )
                            : ListView.builder(
                              padding: const EdgeInsets.all(0),
                              itemCount: filteredAttractions.length,
                              itemBuilder: (context, index) {
                                final attraction = filteredAttractions[index];

                                return TweenAnimationBuilder(
                                  tween: Tween<double>(begin: 0, end: 1),
                                  duration: Duration(
                                    milliseconds: 300 + (index * 50),
                                  ),
                                  curve: Curves.easeOut,
                                  builder: (context, double value, child) {
                                    return Transform.translate(
                                      offset: Offset(50 * (1 - value), 0),
                                      child: Opacity(
                                        opacity: value,
                                        child: child,
                                      ),
                                    );
                                  },
                                  child: GestureDetector(
                                    onTap: () {
                                      Navigator.pushNamed(
                                        context,
                                        '/attractiondetail',
                                        arguments: {
                                          'attractionName': attraction['name'],
                                        },
                                      );
                                     
                                    },
                                    child: Container(
                                      margin: EdgeInsets.only(bottom: 16),
                                      child: Column(
                                        children: [
                                          Container(
                                            height: 180,
                                            width: double.infinity,
                                            child:
                                                networkImageWithErrorHandling(
                                                  attraction['image'],
                                                  errorWidget: Container(
                                                    color: Colors.grey[800],
                                                    child: Center(
                                                      child: Icon(
                                                        Icons.location_on,
                                                        color: Colors.white60,
                                                        size: 42,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                          ),
                                          Container(
                                            width: double.infinity,
                                            padding: EdgeInsets.symmetric(
                                              horizontal: 16,
                                              vertical: 12,
                                            ),
                                            color: Color(0xFF333333),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  children: [
                                                    Expanded(
                                                      child: Column(
                                                        crossAxisAlignment:
                                                            CrossAxisAlignment
                                                                .start,
                                                        children: [
                                                          Text(
                                                            attraction['name'] ??
                                                                'Unknown',
                                                            style: TextStyle(
                                                              color:
                                                                  Colors.white,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .bold,
                                                              fontSize: 16,
                                                            ),
                                                            maxLines: 1,
                                                            overflow:
                                                                TextOverflow
                                                                    .ellipsis,
                                                          ),
                                                          SizedBox(height: 4),
                                                          Text(
                                                            attraction['description'] ??
                                                                'No description available',
                                                            style: TextStyle(
                                                              color:
                                                                  Colors
                                                                      .white70,
                                                              fontSize: 12,
                                                            ),
                                                            maxLines: 1,
                                                            overflow:
                                                                TextOverflow
                                                                    .ellipsis,
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                    Row(
                                                      children: [
                                                        Icon(
                                                          Icons.star,
                                                          color: Colors.amber,
                                                          size: 16,
                                                        ),
                                                        SizedBox(width: 4),
                                                        Text(
                                                          '${attraction['rating']?.toStringAsFixed(1) ?? '4.0'}',
                                                          style: TextStyle(
                                                            color: Colors.white,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                            fontSize: 14,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                                SizedBox(height: 4),
                                                Text(
                                                  attraction['address'] ??
                                                      'No address available',
                                                  style: TextStyle(
                                                    color: Colors.white70,
                                                    fontSize: 12,
                                                  ),
                                                  maxLines: 2,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                                if (attraction['distance'] !=
                                                        null &&
                                                    attraction['distance']
                                                        .toString()
                                                        .isNotEmpty) ...[
                                                  SizedBox(height: 4),
                                                  Text(
                                                    attraction['distance'],
                                                    style: TextStyle(
                                                      color: Colors.white70,
                                                      fontSize: 12,
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
