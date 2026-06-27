import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  TrendingUp,
  Award,
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  Compass,
  Activity,
  X,
  ThumbsUp,
  ThumbsDown,
  Plus,
  MapPin,
  Camera
} from 'lucide-react';
import maplibregl from 'maplibre-gl';
import { io, Socket } from 'socket.io-client';

// --- Types ---
interface Comment {
  id?: string;
  author: string;
  text: string;
  created_at: string;
}

interface IssueReport {
  id: string;
  category: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  s3_media_url: string | null;
  original_media_url: string | null;
  upvotes: number;
  downvotes: number;
  created_at: string;
  comments: Comment[];
  description?: string;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  badges: string[];
  avatarColor: string;
}

// --- Mock Data ---
const MOCK_REPORTS: IssueReport[] = [
  {
    id: 'report-1',
    category: 'Pothole',
    severity: 'Severe',
    status: 'Verified',
    latitude: 37.7749,
    longitude: -122.4194,
    original_media_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80',
    s3_media_url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80&blur=30', // Mocking YOLO blur
    upvotes: 18,
    downvotes: 2,
    created_at: '2026-06-27T10:30:00Z',
    description: 'Deep pothole in the middle lane causing cars to swerve dangerously.',
    comments: [
      { author: 'Marcus Aurelius', text: 'Almost broke my axle here this morning. Be careful!', created_at: '2026-06-27T11:00:00Z' },
      { author: 'City Inspector', text: 'Report routed to road maintenance crew.', created_at: '2026-06-27T12:15:00Z' }
    ]
  },
  {
    id: 'report-2',
    category: 'Waste',
    severity: 'Medium',
    status: 'Reported',
    latitude: 37.7849,
    longitude: -122.4094,
    original_media_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    s3_media_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80&blur=20',
    upvotes: 5,
    downvotes: 0,
    created_at: '2026-06-27T14:20:00Z',
    description: 'Illegal dumping of household waste next to the local park entrance.',
    comments: []
  },
  {
    id: 'report-3',
    category: 'Water Leak',
    severity: 'Severe',
    status: 'Resolved',
    latitude: 37.7649,
    longitude: -122.4294,
    original_media_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    s3_media_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80&blur=15',
    upvotes: 32,
    downvotes: 1,
    created_at: '2026-06-26T08:15:00Z',
    description: 'Water main break bubbling through concrete sidewalk.',
    comments: [
      { author: 'Jane Miller', text: 'Clean-up complete, water shut-off resolved.', created_at: '2026-06-26T16:00:00Z' }
    ]
  },
  {
    id: 'report-4',
    category: 'Broken Infrastructure',
    severity: 'Minor',
    status: 'Reported',
    latitude: 37.7549,
    longitude: -122.4194,
    original_media_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    s3_media_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80&blur=25',
    upvotes: 3,
    downvotes: 0,
    created_at: '2026-06-27T16:10:00Z',
    description: 'Pedestrian signal push button is hanging loose from the pole.',
    comments: []
  }
];

const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Alex Honnold', points: 1250, badges: ['City Legend', 'Community Hero'], avatarColor: 'bg-zinc-900' },
  { rank: 2, name: 'Elena Rostova', points: 980, badges: ['Community Hero', 'Pothole Patrol'], avatarColor: 'bg-zinc-800' },
  { rank: 3, name: 'Kenji Sato', points: 740, badges: ['Neighbourhood Guardian', 'First Reporter'], avatarColor: 'bg-zinc-700' },
  { rank: 4, name: 'Sarah Connor', points: 510, badges: ['Neighbourhood Watch'], avatarColor: 'bg-zinc-600' },
  { rank: 5, name: 'David Goggins', points: 430, badges: ['First Reporter'], avatarColor: 'bg-zinc-500' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'leaderboard' | 'analytics'>('map');
  const [reports, setReports] = useState<IssueReport[]>(MOCK_REPORTS);
  const [selectedReport, setSelectedReport] = useState<IssueReport | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [showBlurOriginal, setShowBlurOriginal] = useState<boolean>(false);
  const [commentInput, setCommentInput] = useState<string>('');

  // Reporting Form State
  const [showReportForm, setShowReportForm] = useState<boolean>(false);
  const [formCategory, setFormCategory] = useState<string>('Pothole');
  const [formSeverity, setFormSeverity] = useState<string>('Medium');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formLatitude, setFormLatitude] = useState<string>('37.7749');
  const [formLongitude, setFormLongitude] = useState<string>('-122.4194');
  const [formPhoto, setFormPhoto] = useState<string | null>(null);

  // Sockets & Map references
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});

  // --- WebSocket Setup ---
  useEffect(() => {
    socketRef.current = io('http://localhost:3000', {
      auth: { userId: 'web-dashboard-admin' },
      transports: ['websocket'],
      autoConnect: true
    });

    socketRef.current.on('connect', () => {
      setIsWsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsWsConnected(false);
    });

    socketRef.current.on('map_update', (newReport: any) => {
      setReports((prev) => [newReport, ...prev]);
    });

    socketRef.current.on('REPORT_AI_PROCESSED', (update: any) => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === update.report_id
            ? { ...r, category: update.category, severity: update.severity, s3_media_url: update.s3_media_url }
            : r
        )
      );
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // --- Map Markers Rendering Function ---
  const updateMapMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Add new markers
    reports.forEach((report) => {
      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full border border-black flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-110';
      el.style.backgroundColor = getSeverityColor(report.severity);
      el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
      `;

      el.addEventListener('click', () => {
        setSelectedReport(report);
      });

      const m = new maplibregl.Marker(el)
        .setLngLat([report.longitude, report.latitude])
        .addTo(map.current!);

      markersRef.current[report.id] = m;
    });
  };

  // --- MapLibre Map Setup ---
  useEffect(() => {
    if (activeTab !== 'map' || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [-122.4194, 37.7749], // SF Center
      zoom: 12
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Handle map clicks to capture coordinates for the report form
    map.current.on('click', (e) => {
      setFormLatitude(e.lngLat.lat.toFixed(5));
      setFormLongitude(e.lngLat.lng.toFixed(5));
    });

    // Populate initial markers
    map.current.on('load', () => {
      updateMapMarkers();
    });

    return () => {
      map.current?.remove();
    };
  }, [activeTab]);

  // Update markers when reports changes
  useEffect(() => {
    updateMapMarkers();
  }, [reports]);

  // --- Helpers ---
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe': return '#000000'; // Black for Severe
      case 'medium': return '#4b5563'; // Dark Gray for Medium
      default: return '#9ca3af'; // Light Gray for Minor
    }
  };

  const getStatusBadge = (status: string) => {
    const base = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ';
    switch (status.toLowerCase()) {
      case 'resolved': return base + 'bg-zinc-200 text-zinc-800 border border-zinc-300';
      case 'verified': return base + 'bg-zinc-900 text-white border border-black';
      default: return base + 'bg-zinc-100 text-zinc-600 border border-zinc-200';
    }
  };

  // --- Filtering ---
  const filteredReports = reports.filter((r) => {
    const matchesCategory = filterCategory === 'All' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // --- Form Handlers ---
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(formLatitude);
    const lon = parseFloat(formLongitude);

    if (isNaN(lat) || isNaN(lon)) {
      alert('Please enter valid coordinates or click on the map.');
      return;
    }

    const defaultPhoto = 'https://images.unsplash.com/photo-1599740831464-5eecfa64b8a5?auto=format&fit=crop&w=800&q=80';
    const originalPhoto = formPhoto || defaultPhoto;
    
    // Simulate YOLOv8 blur
    const blurredPhoto = originalPhoto;

    const newReport: IssueReport = {
      id: `report-${Date.now()}`,
      category: formCategory,
      severity: formSeverity,
      status: 'Reported',
      latitude: lat,
      longitude: lon,
      original_media_url: originalPhoto,
      s3_media_url: blurredPhoto,
      upvotes: 1,
      downvotes: 0,
      created_at: new Date().toISOString(),
      description: formDescription,
      comments: []
    };

    setReports((prev) => [newReport, ...prev]);

    // Recenter map on the new report
    if (map.current) {
      map.current.flyTo({ center: [lon, lat], zoom: 14 });
    }

    // Reset Form
    setFormDescription('');
    setFormPhoto(null);
    setShowReportForm(false);
  };

  const handleVote = (id: string, type: 'up' | 'down') => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            upvotes: type === 'up' ? r.upvotes + 1 : r.upvotes,
            downvotes: type === 'down' ? r.downvotes + 1 : r.downvotes
          };
        }
        return r;
      })
    );
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport((prev) => prev ? {
        ...prev,
        upvotes: type === 'up' ? prev.upvotes + 1 : prev.upvotes,
        downvotes: type === 'down' ? prev.downvotes + 1 : prev.downvotes
      } : null);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedReport) return;

    const newComment: Comment = {
      author: 'Citizen Advocate',
      text: commentInput,
      created_at: new Date().toISOString()
    };

    setReports((prev) =>
      prev.map((r) => {
        if (r.id === selectedReport.id) {
          return {
            ...r,
            comments: [...r.comments, newComment]
          };
        }
        return r;
      })
    );

    setSelectedReport((prev) => prev ? {
      ...prev,
      comments: [...prev.comments, newComment]
    } : null);

    setCommentInput('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900">
      {/* --- Top Navbar (Frosted White) --- */}
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="bg-black p-2.5 rounded-xl shadow-sm">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-black m-0 leading-tight">
              COMMUNITY HERO
            </h1>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold m-0 mt-0.5">
              Civic Engagement Platform
            </p>
          </div>
        </div>

        {/* --- Top Nav Tabs --- */}
        <nav className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'map' ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            Live Map
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'leaderboard' ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'analytics' ? 'bg-black text-white' : 'text-zinc-600 hover:text-black'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Analytics
          </button>
        </nav>

        {/* --- Micro-Status Indicators --- */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full text-xs">
            <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-zinc-900 animate-pulse' : 'bg-zinc-400'}`} />
            <span className="text-zinc-600 font-semibold">{isWsConnected ? 'Live Connection' : 'Simulation Mode'}</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-full text-xs">
            <Activity className="h-3.5 w-3.5 text-zinc-900" />
            <span className="text-zinc-600 font-bold">YOLO: <span className="text-zinc-950 font-black">ACTIVE</span></span>
          </div>
        </div>
      </header>

      {/* --- Main Dashboard Container --- */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'map' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - List of Issues or Report Form */}
            <aside className="w-[420px] border-r border-zinc-200 bg-zinc-50/50 flex flex-col flex-shrink-0">
              
              {/* Toggle Form / List Header */}
              <div className="p-4 border-b border-zinc-200 flex justify-between items-center gap-3">
                <h2 className="text-sm font-black uppercase tracking-wider text-black m-0">
                  {showReportForm ? 'Report New Issue' : 'Civic Reports'}
                </h2>
                <button
                  onClick={() => setShowReportForm(!showReportForm)}
                  className="flex items-center gap-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all"
                >
                  {showReportForm ? (
                    <>Cancel</>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Report Issue
                    </>
                  )}
                </button>
              </div>

              {/* Conditional Rendering: Form or List */}
              {showReportForm ? (
                <form onSubmit={handleCreateReport} className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Category */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-black font-semibold"
                    >
                      <option value="Pothole">Potholes</option>
                      <option value="Waste">Waste / Garbage</option>
                      <option value="Water Leak">Water Leak</option>
                      <option value="Broken Infrastructure">Broken Infrastructure</option>
                      <option value="Graffiti">Graffiti</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Severity</label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value)}
                      className="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-black font-semibold"
                    >
                      <option value="Minor">Minor</option>
                      <option value="Medium">Medium</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Description</label>
                    <textarea
                      placeholder="Explain the issue in detail..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      required
                      className="bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-black h-24 resize-none font-medium"
                    />
                  </div>

                  {/* Location Coordinate Select */}
                  <div className="space-y-2 bg-zinc-100 p-3 rounded-xl border border-zinc-200">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5 text-zinc-900" />
                      <span>Map Location Coordinates</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-medium">Click anywhere on the map to automatically pin coordinates.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Latitude"
                        value={formLatitude}
                        onChange={(e) => setFormLatitude(e.target.value)}
                        className="bg-white border border-zinc-300 rounded-lg px-2 py-1.5 text-xs text-zinc-900"
                      />
                      <input
                        type="text"
                        placeholder="Longitude"
                        value={formLongitude}
                        onChange={(e) => setFormLongitude(e.target.value)}
                        className="bg-white border border-zinc-300 rounded-lg px-2 py-1.5 text-xs text-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Photo Upload Input */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Add Photo Upload</label>
                    {formPhoto ? (
                      <div className="relative rounded-xl overflow-hidden aspect-video border border-zinc-300 bg-zinc-100">
                        <img src={formPhoto} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormPhoto(null)}
                          className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-1 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-zinc-300 hover:border-black rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white">
                        <Camera className="h-6 w-6 text-zinc-500" />
                        <span className="text-xs text-zinc-600 font-bold">Choose Image File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-black hover:bg-zinc-800 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                  >
                    Submit Civic Report
                  </button>
                </form>
              ) : (
                /* Regular Issue List */
                <>
                  <div className="p-4 border-b border-zinc-200 flex flex-col gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-zinc-300 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-black text-zinc-900 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Category</label>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="bg-white border border-zinc-300 rounded-lg px-2 py-1.5 text-xs text-zinc-900 font-bold"
                        >
                          <option value="All">All Categories</option>
                          <option value="Pothole">Potholes</option>
                          <option value="Waste">Waste</option>
                          <option value="Water Leak">Water Leaks</option>
                          <option value="Broken Infrastructure">Broken Infra</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-zinc-500 uppercase font-black tracking-wider">Status</label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="bg-white border border-zinc-300 rounded-lg px-2 py-1.5 text-xs text-zinc-900 font-bold"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Reported">Reported</option>
                          <option value="Verified">Verified</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Reports List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {filteredReports.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400">
                        <p className="text-xs font-semibold">No reports match your filters.</p>
                      </div>
                    ) : (
                      filteredReports.map((report) => (
                        <div
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          className={`p-4 rounded-xl cursor-pointer border transition-all ${
                            selectedReport?.id === report.id
                              ? 'bg-zinc-100 border-black'
                              : 'bg-white border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-xs font-black uppercase text-black">{report.category}</span>
                            <span className="text-[9px] text-zinc-500 font-bold">
                              {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 line-clamp-2 mb-3 font-medium">
                            {report.description || 'No description provided.'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getSeverityColor(report.severity) }} />
                              <span className="text-xs text-zinc-600 font-bold">{report.severity}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500 font-bold">
                              <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {report.upvotes}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {report.comments.length}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </aside>

            {/* Center Area: Map container */}
            <div className="flex-1 relative bg-zinc-100">
              <div ref={mapContainer} className="absolute inset-0" />

              {/* Drawer (Sliding detail view) */}
              {selectedReport && (
                <div className="absolute top-4 right-4 bottom-4 w-[480px] glass rounded-2xl shadow-xl flex flex-col z-10 border border-zinc-300 overflow-hidden text-zinc-900">
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-zinc-200 bg-white/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-black text-sm uppercase">{selectedReport.category}</span>
                        {getStatusBadge(selectedReport.status)}
                      </div>
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">ID: {selectedReport.id}</p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-black transition-all"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Drawer Scrollable Body */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Media Slider / Image display */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">YOLOv8 Privacy Blurring</span>
                        <button
                          onClick={() => setShowBlurOriginal(!showBlurOriginal)}
                          className="text-xs text-black hover:underline font-bold uppercase tracking-wider"
                        >
                          Show {showBlurOriginal ? 'Blurred' : 'Original'}
                        </button>
                      </div>

                      <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-200 border border-zinc-300 shadow-sm">
                        <img
                          src={showBlurOriginal ? selectedReport.original_media_url || '' : selectedReport.s3_media_url || ''}
                          alt="Report media"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/85 px-2 py-1 rounded text-[9px] font-bold text-white uppercase tracking-wider">
                          {showBlurOriginal ? 'Original Image' : 'Faces & Plates Anonymized'}
                        </div>
                      </div>
                    </div>

                    {/* Upvote & Validation Metrics */}
                    <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Validation Rate</span>
                        <span className="text-xs font-black text-black">
                          {Math.round((selectedReport.upvotes / (selectedReport.upvotes + selectedReport.downvotes || 1)) * 100)}% Verified
                        </span>
                      </div>

                      {/* Vote Progress Bar */}
                      <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black"
                          style={{
                            width: `${(selectedReport.upvotes / (selectedReport.upvotes + selectedReport.downvotes || 1)) * 100}%`
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs text-zinc-500 font-bold">
                        <span>{selectedReport.upvotes} Upvotes</span>
                        <span>{selectedReport.downvotes} Downvotes</span>
                      </div>

                      {/* Vote Buttons */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleVote(selectedReport.id, 'up')}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-black hover:bg-zinc-800 border border-black py-2 rounded-xl text-xs font-bold text-white transition-all"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Verify
                        </button>
                        <button
                          onClick={() => handleVote(selectedReport.id, 'down')}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 py-2 rounded-xl text-xs font-bold text-zinc-800 transition-all"
                        >
                          <ThumbsDown className="h-3.5 w-3.5" />
                          Flag
                        </button>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                        <span className="text-zinc-500 font-bold">Reported on</span>
                        <p className="font-extrabold text-black mt-1">
                          {new Date(selectedReport.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                        <span className="text-zinc-500 font-bold">Severity Level</span>
                        <p className="font-extrabold mt-1 text-black">
                          {selectedReport.severity}
                        </p>
                      </div>
                    </div>

                    {/* Comments section */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Discussion</h4>
                      
                      <div className="space-y-2">
                        {selectedReport.comments.length === 0 ? (
                          <p className="text-xs text-zinc-400 italic">No comments yet. Start the conversation.</p>
                        ) : (
                          selectedReport.comments.map((comment, index) => (
                            <div key={index} className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-bold text-zinc-500">
                                <span className="text-black">{comment.author}</span>
                                <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-zinc-700 font-medium">{comment.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add comment box */}
                      <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Add comment..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-black text-zinc-900"
                        />
                        <button
                          type="submit"
                          className="bg-black hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Leaderboard Tab --- */}
        {activeTab === 'leaderboard' && (
          <div className="flex-1 p-8 overflow-y-auto flex justify-center bg-white">
            <div className="w-full max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase text-black">Civic Leaderboard</h2>
                  <p className="text-xs text-zinc-500">Top community members ranked by Hero Points.</p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-xl text-xs">
                  <Award className="h-4 w-4 text-black" />
                  <span className="text-zinc-800 font-bold">Active Cycle: June 2026</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden border border-zinc-200">
                <div className="grid grid-cols-12 bg-zinc-50 p-4 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  <div className="col-span-1 text-center">Rank</div>
                  <div className="col-span-4">Community Member</div>
                  <div className="col-span-2 text-right">Hero Points</div>
                  <div className="col-span-5 pl-8">Milestones</div>
                </div>

                <div className="divide-y divide-zinc-200">
                  {MOCK_LEADERBOARD.map((user) => (
                    <div key={user.rank} className="grid grid-cols-12 p-4 items-center text-sm hover:bg-zinc-50/50 transition-all">
                      <div className="col-span-1 text-center font-black text-zinc-500">
                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                      </div>
                      
                      <div className="col-span-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${user.avatarColor} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-extrabold text-black">{user.name}</span>
                      </div>

                      <div className="col-span-2 text-right font-mono font-bold text-black">
                        {user.points.toLocaleString()}
                      </div>

                      <div className="col-span-5 flex flex-wrap gap-1.5 pl-8">
                        {user.badges.map((badge, idx) => (
                          <span
                            key={idx}
                            className="bg-zinc-100 text-zinc-800 border border-zinc-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          >
                            🏅 {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Analytics Tab --- */}
        {activeTab === 'analytics' && (
          <div className="flex-1 p-8 overflow-y-auto bg-white flex justify-center">
            <div className="w-full max-w-4xl space-y-6">
              <div>
                <h2 className="text-xl font-black uppercase text-black">Civic Impact Analytics</h2>
                <p className="text-xs text-zinc-500">Real-time statistics on hyperlocal civic resolutions.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Reports</span>
                    <p className="text-2xl font-black text-black mt-1">1,482</p>
                    <span className="text-[9px] text-zinc-500 font-semibold">+14% vs last week</span>
                  </div>
                  <div className="bg-black p-2.5 rounded-xl">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Resolution Rate</span>
                    <p className="text-2xl font-black text-black mt-1">82.4%</p>
                    <span className="text-[9px] text-zinc-500 font-semibold">+2.1% efficiency gains</span>
                  </div>
                  <div className="bg-black p-2.5 rounded-xl">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Avg. Fix Time</span>
                    <p className="text-2xl font-black text-black mt-1">3.4 Days</p>
                    <span className="text-[9px] text-zinc-500 font-semibold">Under target of 5.0 days</span>
                  </div>
                  <div className="bg-black p-2.5 rounded-xl">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Graphic Charts (Custom Monochrome SVGs) */}
              <div className="grid grid-cols-2 gap-4">
                {/* Reports by Category Bar Chart */}
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-black uppercase text-black">Reports by Category</h3>
                  
                  <div className="space-y-3">
                    {[
                      { name: 'Pothole', count: 684, percent: 70, color: 'bg-zinc-900' },
                      { name: 'Waste / Garbage', count: 320, percent: 45, color: 'bg-zinc-700' },
                      { name: 'Water Leak', count: 184, percent: 25, color: 'bg-zinc-500' },
                      { name: 'Broken Infrastructure', count: 210, percent: 30, color: 'bg-zinc-400' },
                      { name: 'Graffiti', count: 84, percent: 12, color: 'bg-zinc-300' }
                    ].map((cat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-zinc-700">
                          <span>{cat.name}</span>
                          <span className="text-black font-extrabold">{cat.count}</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution Speed Trend */}
                <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                  <h3 className="text-xs font-black uppercase text-black mb-2">Resolution Speed Trend</h3>
                  
                  <div className="w-full flex-1 min-h-[160px] flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#e4e4e7" strokeWidth="1" />
                      <line x1="0" y1="60" x2="300" y2="60" stroke="#e4e4e7" strokeWidth="1" />
                      <line x1="0" y1="100" x2="300" y2="100" stroke="#e4e4e7" strokeWidth="1" />
                      
                      {/* Path Line */}
                      <path
                        d="M 10 100 L 60 85 L 110 70 L 160 50 L 210 55 L 260 40 Q 280 30 290 25"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Dots on line */}
                      <circle cx="10" cy="100" r="4.5" fill="#000000" />
                      <circle cx="60" cy="85" r="4.5" fill="#000000" />
                      <circle cx="110" cy="70" r="4.5" fill="#000000" />
                      <circle cx="160" cy="50" r="4.5" fill="#000000" />
                      <circle cx="210" cy="55" r="4.5" fill="#000000" />
                      <circle cx="260" cy="40" r="4.5" fill="#000000" />
                      <circle cx="290" cy="25" r="4.5" fill="#000000" />
                    </svg>
                  </div>

                  <div className="flex justify-between text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-2 pt-2 border-t border-zinc-200">
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
