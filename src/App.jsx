import React, { useState, useEffect } from 'react';
import {
    Calculator,
    Trash2,
    Plus,
    Download,
    HardHat,
    Layout,
    Layers,
    Grid,
    Home,
    ChevronRight,
    Info,
    Square,
    Settings2,
    Home as RoofIcon,
    MessageSquare,
    Save,
    FolderOpen,
    Share2,
    HelpCircle,
    FileText,
    User,
    Users,
    TrendingUp,
    DollarSign,
    Calendar,
    ChevronLeft,
    Printer,
    Edit2,
    Lock,
    X,
    Sliders,
    LogOut,
    Shield,
    Monitor,
    Smartphone
} from 'lucide-react';
import { supabase } from './supabaseClient';

// --- CONFIGURATIONS TECHNIQUES ---
const RATIOS = {
    CIMENT_BETON: 350, // kg par m3
    SABLE_BETON: 0.4,   // m3 par m3 de béton
    GRAVIER_BETON: 0.8, // m3 par m3 de béton
    DENSITE_SABLE: 1.6, // Tonnes/m3
    DENSITE_GRAVIER: 1.5, // Tonnes/m3
    MORTIER_PAR_M2_BASE: 0.02,
    TOLE_LARGEUR_UTILE: 0.85, // Largeur après recouvrement (m)
    TOLE_LONGUEUR_STD: 2.0,   // Longueur standard d'une feuille (m)
};

// Poids nominal de l'acier par mètre linéaire (kg/m)
const STEEL_WEIGHTS = {
    6: 0.222,
    8: 0.395,
    10: 0.617,
    12: 0.888,
    14: 1.208,
    16: 1.578
};

const BRICK_TYPES = [
    { id: 'b10', label: 'Brique de 10', l: 0.4, h: 0.2, e: 0.10, mortierMult: 0.7 },
    { id: 'b15', label: 'Brique de 15', l: 0.4, h: 0.2, e: 0.15, mortierMult: 1.0 },
    { id: 'b20', label: 'Brique de 20', l: 0.4, h: 0.2, e: 0.20, mortierMult: 1.3 },
];

// Admin email constant
const ADMIN_EMAIL = 'jeancymif@gmail.com';

const BOARD_TYPES = [
    { id: 'p3_15', label: 'Planche 3m x 15cm', l: 3.0, w: 0.15 },
    { id: 'p3_20', label: 'Planche 3m x 20cm', l: 3.0, w: 0.20 },
    { id: 'p4_20', label: 'Planche 4m x 20cm', l: 4.0, w: 0.20 },
    { id: 'p4_25', label: 'Planche 4m x 25cm', l: 4.0, w: 0.25 },
    { id: 'p4_30', label: 'Madrier 4m x 30cm', l: 4.0, w: 0.30 },
];

const TILE_TYPES = [
    { id: 't30', label: 'Carreau 30x30 cm', l: 0.30, w: 0.30 },
    { id: 't40', label: 'Carreau 40x40 cm', l: 0.40, w: 0.40 },
    { id: 't45', label: 'Carreau 45x45 cm', l: 0.45, w: 0.45 },
    { id: 't50', label: 'Carreau 50x50 cm', l: 0.50, w: 0.50 },
    { id: 't60', label: 'Carreau 60x60 cm', l: 0.60, w: 0.60 },
    { id: 't60_120', label: 'Carreau 60x120 cm', l: 0.60, w: 1.20 },
];

// --- SHARED COMPONENTS ---
const TopNavbar = ({ onConnect, currentUser, onProfileClick }) => (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50 px-4 py-3 flex justify-between items-center border-b border-gray-100 h-16">
        <div className="flex flex-col">
            <h1 className="text-xl font-black text-gray-900 tracking-tight italic leading-none">BatiCalcul</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Expertise Gros Œuvre</p>
        </div>
        {currentUser ? (
            <button
                onClick={onProfileClick}
                className="flex items-center gap-3 hover:bg-gray-50 rounded-full px-3 py-1 transition-colors"
            >
                <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-gray-800">{currentUser.name}</p>
                    <p className="text-[10px] text-gray-500">{currentUser.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
            </button>
        ) : (
            <button onClick={onConnect} className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-xs shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                Se connecter
            </button>
        )}
    </nav>
);

const StatCard = ({ title, value, unit, extra, color }) => (
    <div className={`${color} p-4 rounded-2xl text-white shadow-md relative overflow-hidden transition-all hover:scale-[1.02]`}>
        <p className="text-[9px] opacity-70 uppercase font-black mb-1 tracking-widest">{title}</p>
        <div className="flex items-baseline gap-1">
            <span className="text-xl font-black">{value}</span>
            <span className="text-[9px] font-bold opacity-80">{unit}{extra}</span>
        </div>
    </div>
);

const NavItem = ({ active, icon, label, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${active ? 'text-blue-600 bg-blue-50 scale-105' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
        {icon}
        <span className={`text-[9px] font-black uppercase tracking-tighter transition-all ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
);

const ListItem = ({ title, details, color, onRemove }) => (
    <div className={`flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm border-l-4 ${color} transition-all hover:shadow-md`}>
        <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-[11px] uppercase tracking-wide">{title}</span>
            <span className="text-[9px] text-gray-500 font-medium">{details}</span>
        </div>
        <button onClick={onRemove} className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
    </div>
);

const AdminView = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-purple-100 p-3 rounded-2xl">
                        <Shield size={32} className="text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Administration</h1>
                        <p className="text-gray-500 font-medium">Gestion des utilisateurs et statistiques</p>
                    </div>
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Utilisateurs Total</h3>
                        <Users size={20} className="text-blue-500" />
                    </div>
                    <p className="text-4xl font-black text-gray-900">{users.length}</p>
                    <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Inscrits sur la plateforme
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900">Utilisateurs Inscrits</h3>
                    <button onClick={fetchUsers} className="text-blue-600 hover:text-blue-700 font-bold text-sm">
                        Actualiser
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-400">Chargement...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold text-xs">
                                <tr>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Nom</th>
                                    <th className="p-4">Date d'inscription</th>
                                    <th className="p-4 text-right">ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold text-gray-900">{user.email || 'Email non disponible'}</td>
                                        <td className="p-4 text-gray-600 font-medium">{user.username || '-'}</td>
                                        <td className="p-4 text-gray-500">
                                            {new Date(user.updated_at || Date.now()).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="p-4 text-right text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}...</td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500">Aucun utilisateur trouvé</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [project, setProject] = useState({
        semelles: [],
        poteaux: [],
        poutres: [],
        murs: [],
        dalles: [],
        toiture: null, // Stocke { surfaceAuSol, penteDeg }
        carrelage: [],
        escaliers: [],
        divers: []
    });

    const [totals, setTotals] = useState({
        ciment: 0,
        sable: 0,
        gravier: 0,
        briques: 0,
        acier: 0,
        coffrage: 0, // Surface totale en m2
        toles: 0,
        chevrons: 0,
        surfaceCarrelage: 0,
        nbCarreaux: 0
    });

    const [projectName, setProjectName] = useState('');
    const [projectType, setProjectType] = useState('Maison');
    const [projectFloors, setProjectFloors] = useState(1);
    const [projectRooms, setProjectRooms] = useState(1);

    // UI State
    const [plusViewMode, setPlusViewMode] = useState('menu'); // 'menu' | 'about' | 'settings' | 'legal' | 'help' | 'profile'
    const [activeConstructionForms, setActiveConstructionForms] = useState([]);
    const [projectViewMode, setProjectViewMode] = useState('list'); // 'list' | 'editor'
    const [savedProjects, setSavedProjects] = useState(() => {
        const saved = localStorage.getItem('baticalkul_projects');
        return saved ? JSON.parse(saved) : [
            { id: 1, name: 'Maison de campagne', date: '10/02/2026', totalMat: '125 Sacs', projectData: null },
            { id: 2, name: 'Clôture Jardin', date: '05/02/2026', totalMat: '45 Sacs', projectData: null }
        ];
    });

    const [currentUser, setCurrentUser] = useState(null); // { name: 'Pseudo', ... }
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Initialize Supabase Auth
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Fetch profile data
                supabase.from('profiles').select('username').eq('id', session.user.id).single()
                    .then(({ data }) => {
                        setCurrentUser({ ...session.user, name: data?.username || session.user.email.split('@')[0] });
                    });
            } else {
                setCurrentUser(null);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                supabase.from('profiles').select('username').eq('id', session.user.id).single()
                    .then(({ data }) => {
                        setCurrentUser({ ...session.user, name: data?.username || session.user.email.split('@')[0] });
                    });
            } else {
                setCurrentUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Save projects to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('baticalkul_projects', JSON.stringify(savedProjects));
    }, [savedProjects]);

    // Project Management Functions
    const handleSaveProject = () => {
        if (!projectName.trim()) {
            alert('Veuillez entrer un nom de projet');
            return;
        }

        const newProject = {
            id: Date.now(),
            name: projectName,
            type: projectType,
            floors: projectFloors,
            rooms: projectRooms,
            date: new Date().toLocaleDateString('fr-FR'),
            totalMat: `${totals.ciment} Sacs`,
            projectData: { ...project },
            totals: { ...totals }
        };

        setSavedProjects([newProject, ...savedProjects]);
        setProjectName('');
        setProjectType('Maison');
        setProjectFloors(1);
        setProjectRooms(1);
        alert(`Projet "${projectName}" sauvegardé !`);
    };

    const handleLoadProject = (projectToLoad) => {
        if (!projectToLoad.projectData) {
            alert('Ce projet n\'a pas de données sauvegardées');
            return;
        }
        setProject(projectToLoad.projectData);
        alert(`Projet "${projectToLoad.name}" chargé !`);
    };

    const handleDeleteProject = (projectId) => {
        if (confirm('Voulez-vous vraiment supprimer ce projet ?')) {
            setSavedProjects(savedProjects.filter(p => p.id !== projectId));
        }
    };

    // Scroll to Top on Tab Change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [activeTab]);

    const [forumViewMode, setForumViewMode] = useState('list'); // 'list' | 'detail' | 'create'
    const [activeTopicId, setActiveTopicId] = useState(null);
    const [topics, setTopics] = useState([
        {
            id: 1,
            title: "Dosage dalle extérieure ?",
            author: "Jean Dupont",
            category: "Chantier",
            date: "Il y a 2h",
            likes: 12,
            replies: 5,
            tags: ["Béton", "Extérieur"],
            messages: [
                { id: 1, author: 'Jean Dupont', text: 'Bonjour, je cherche un bon dosage pour une dalle extérieure exposée au gel. Des conseils ?', time: 'Il y a 2h', avatar: 'JD', color: 'bg-pink-100 text-pink-600' },
                { id: 2, author: 'Moi', text: "Pour l'extérieur, part sur 350kg/m³ minimum, et pense aux joints de dilatation tous les 3-4m !", time: 'À l\'instant', isMe: true, color: 'bg-blue-100 text-blue-600' }
            ]
        },
        {
            id: 2,
            title: "Prix du ciment en ce moment",
            author: "Marc B.",
            category: "Prix",
            date: "Hier",
            likes: 8,
            replies: 12,
            tags: ["Matériaux", "Coût"],
            messages: []
        },
        {
            id: 3,
            title: "Avis sur les briques de 15 vs 20",
            author: "Sarah L.",
            category: "Général",
            date: "Il y a 3j",
            likes: 5,
            replies: 2,
            tags: ["Maçonnerie"],
            messages: []
        }
    ]);

    // --- LOGIQUE DE CALCUL GLOBAL ---
    const calculateProjectTotals = (proj) => {
        let volBetonTotal = 0;
        let volMortierTotal = 0;
        let nbBriquesTotal = 0;
        let kgAcierTotal = 0;
        let nbTolesTotal = 0;
        let nbChevronsTotal = 0;
        let surfaceCarrelageTotal = 0;
        let nbCarreauxTotal = 0;

        let kgCimentTotal = 0;
        let surfaceCoffrageTotal = 0;

        // Calcul Semelles
        proj.semelles.forEach(s => {
            const v = s.longueur * s.largeur * s.epaisseur;
            volBetonTotal += v;
            kgCimentTotal += v * RATIOS.CIMENT_BETON;
            const nbBarres = 12;
            const longBarre = (s.longueur + s.largeur);
            kgAcierTotal += nbBarres * longBarre * (STEEL_WEIGHTS[s.diametre] || 0.888);
        });

        // Calcul Poutres/Chaînages
        proj.poutres.forEach(p => {
            const v = p.longueur * p.sectionL * p.sectionH;
            volBetonTotal += v;
            kgCimentTotal += v * RATIOS.CIMENT_BETON;
            const kgLong = 4 * p.longueur * (STEEL_WEIGHTS[p.diametre] || 0.888);
            const espacement = p.espacementCadre || 0.20;
            const nbCadres = Math.ceil(p.longueur / espacement) + 1;
            const perimetreCadre = (p.sectionL + p.sectionH) * 2;
            const kgCadres = nbCadres * perimetreCadre * (STEEL_WEIGHTS[p.diametreCadre] || 0.222);
            kgAcierTotal += (kgLong + kgCadres);

            // Calcul Coffrage (Fond + 2 Joues)
            const surfacePoutre = (p.sectionL + (2 * p.sectionH)) * p.longueur;
            surfaceCoffrageTotal += surfacePoutre * 1.1; // Marge 10%
        });

        // Calcul Poteaux
        proj.poteaux.forEach(p => {
            const q = p.quantity || 1;
            const v = p.sectionL * p.sectionl * p.hauteur * q;
            volBetonTotal += v;
            kgCimentTotal += v * RATIOS.CIMENT_BETON;

            // Acier Vertical
            const kgVert = p.nbBarres * p.hauteur * (STEEL_WEIGHTS[p.diametre] || 0.888) * q;

            // Acier Cadres
            const perimetre = (p.sectionL + p.sectionl) * 2;
            const nbCadres = Math.ceil(p.hauteur / (p.espacementCadre || 0.20)) + 1;
            const kgCadres = nbCadres * perimetre * (STEEL_WEIGHTS[p.diametreCadre] || 0.222) * q;

            kgAcierTotal += (kgVert + kgCadres);

            // Coffrage (4 faces)
            const surface = perimetre * p.hauteur * q;
            surfaceCoffrageTotal += surface * 1.1; // Marge 10%
        });

        // Calcul Murs
        proj.murs.forEach(m => {
            const briqueInfo = BRICK_TYPES.find(b => b.id === m.briqueId) || BRICK_TYPES[1];
            const surfaceNette = (m.longueur * m.hauteur) - (m.ouvertures || 0);
            nbBriquesTotal += surfaceNette / (briqueInfo.l * briqueInfo.h);
            const qtyMortier = surfaceNette * RATIOS.MORTIER_PAR_M2_BASE * briqueInfo.mortierMult;
            volMortierTotal += qtyMortier;
            kgCimentTotal += qtyMortier * RATIOS.CIMENT_BETON;
        });

        // Calcul Dalles
        proj.dalles.forEach(d => {
            const v = d.longueur * d.largeur * d.epaisseur;
            volBetonTotal += v;
            kgCimentTotal += v * RATIOS.CIMENT_BETON;

            // Calcul Nappe (treillis)
            const nbBarresLong = Math.ceil(d.largeur / d.maille) + 1;
            const nbBarresLarg = Math.ceil(d.longueur / d.maille) + 1;

            const totalLineaire = (nbBarresLong * d.longueur) + (nbBarresLarg * d.largeur);
            kgAcierTotal += totalLineaire * (STEEL_WEIGHTS[d.diametre] || 0.395);

            // Calcul Coffrage Dalle
            const surface = d.longueur * d.largeur;
            surfaceCoffrageTotal += surface;

            // Calcul Chevrons
            const espac = d.espacementEtaiement || 0.60;
            const nbLignes = Math.ceil(d.longueur / espac) + 1;
            const nbColonnes = Math.ceil(d.largeur / espac) + 1;
            nbChevronsTotal += (nbLignes * nbColonnes);
        });

        // Calcul Divers / Autre Béton
        proj.divers.forEach(d => {
            const q = d.quantity || 1;
            const v = d.longueur * d.largeur * d.epaisseur * q;
            volBetonTotal += v;
            const dosage = d.dosage || 350;
            kgCimentTotal += v * dosage;

            if (d.isReinforced && d.steelRatio) {
                kgAcierTotal += v * d.steelRatio;
            }
        });

        // Calcul Escaliers
        proj.escaliers.forEach(e => {
            volBetonTotal += e.volume;
            kgCimentTotal += e.volume * e.dosage;
            kgAcierTotal += e.volume * 80;
        });

        // Calcul Toiture
        if (proj.toiture) {
            const angleRad = (proj.toiture.penteDeg * Math.PI) / 180;
            const surfaceReelle = proj.toiture.surfaceAuSol / Math.cos(angleRad);
            const surfaceUtileTole = RATIOS.TOLE_LONGUEUR_STD * RATIOS.TOLE_LARGEUR_UTILE;
            nbTolesTotal = Math.ceil(surfaceReelle / surfaceUtileTole);
        }

        // Calcul Carrelage
        proj.carrelage.forEach(c => {
            const surface = c.longueur * c.largeur;
            surfaceCarrelageTotal += surface;
            const tile = TILE_TYPES.find(t => t.id === c.tileId) || TILE_TYPES[4];
            const surfaceCarreau = tile.l * tile.w;
            nbCarreauxTotal += Math.ceil((surface * 1.05) / surfaceCarreau);
        });

        return {
            ciment: Math.ceil(kgCimentTotal / 50),
            sable: ((volBetonTotal + volMortierTotal) * RATIOS.SABLE_BETON).toFixed(2),
            gravier: (volBetonTotal * RATIOS.GRAVIER_BETON).toFixed(2),
            briques: Math.ceil(nbBriquesTotal * (1 + ((proj.brickWaste !== undefined ? proj.brickWaste : 5) / 100))),
            acier: Math.ceil(kgAcierTotal),
            coffrage: surfaceCoffrageTotal.toFixed(2),
            toles: nbTolesTotal,
            chevrons: nbChevronsTotal,
            surfaceCarrelage: surfaceCarrelageTotal.toFixed(2),
            nbCarreaux: nbCarreauxTotal
        };
    };

    // --- QUICK CALC STATE (Independent from Project) ---
    const [quickProject, setQuickProject] = useState({
        semelles: [], poteaux: [], poutres: [], murs: [], dalles: [],
        toiture: null, carrelage: [], escaliers: [], divers: [],
        brickWaste: 5
    });
    const [quickTotals, setQuickTotals] = useState({
        ciment: 0, sable: 0, gravier: 0, briques: 0, acier: 0,
        coffrage: 0, toles: 0, chevrons: 0, surfaceCarrelage: 0, nbCarreaux: 0
    });

    useEffect(() => {
        setQuickTotals(calculateProjectTotals(quickProject));
    }, [quickProject]);

    useEffect(() => {
        setTotals(calculateProjectTotals(project));
    }, [project]);

    // --- COMPOSANTS DE SAISIE ---
    const AddSemelle = ({ onAdd }) => {
        const [temp, setTemp] = useState({ longueur: 1, largeur: 1, epaisseur: 0.3, diametre: 12 });
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase">
                    <Layers size={16} className="text-blue-600" /> Semelle Isolée
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Longueur (m)</label>
                        <input type="number" placeholder="L (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, longueur: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Largeur (m)</label>
                        <input type="number" placeholder="l (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, largeur: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Épaisseur (m)</label>
                        <input type="number" placeholder="Ep (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, epaisseur: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Aciers</label>
                        <select className="w-full p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.diametre} onChange={e => setTemp({ ...temp, diametre: parseInt(e.target.value) })}>
                            {[8, 10, 12, 14].map(d => <option key={d} value={d}>Acier Φ {d}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> AJOUTER SEMELLE</button>
            </div>
        );
    };

    const AddPoteau = ({ onAdd }) => {
        const [temp, setTemp] = useState({ hauteur: 3, sectionL: 0.2, sectionl: 0.2, nbBarres: 4, diametre: 12, espacementCadre: 0.20, diametreCadre: 6, boardId: 'p4_20', quantity: 1 });
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase">
                    <Grid size={16} className="text-blue-600" /> Poteau
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Quantité</label>
                        <input type="number" placeholder="1" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.quantity} onChange={e => setTemp({ ...temp, quantity: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Hauteur (m)</label>
                        <input type="number" placeholder="H (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.hauteur} onChange={e => setTemp({ ...temp, hauteur: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">L (m)</label>
                        <input type="number" placeholder="L (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.sectionL} onChange={e => setTemp({ ...temp, sectionL: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">l (m)</label>
                        <input type="number" placeholder="l (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.sectionl} onChange={e => setTemp({ ...temp, sectionl: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Aciers</label>
                        <div className="flex gap-2">
                            <input type="number" className="w-16 p-2 bg-gray-50 border rounded text-xs" value={temp.nbBarres} onChange={e => setTemp({ ...temp, nbBarres: parseInt(e.target.value) })} />
                            <select className="flex-1 p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.diametre} onChange={e => setTemp({ ...temp, diametre: parseInt(e.target.value) })}>
                                {[8, 10, 12, 14, 16].map(d => <option key={d} value={d}>Barres Φ {d}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Planche de Coffrage</label>
                        <select className="w-full p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.boardId} onChange={e => setTemp({ ...temp, boardId: e.target.value })}>
                            {BOARD_TYPES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> AJOUTER POTEAU</button>
            </div>
        );
    };

    const AddPoutre = ({ onAdd }) => {
        const [temp, setTemp] = useState({ longueur: 4, sectionL: 0.2, sectionH: 0.3, diametre: 12, espacementCadre: 0.20, diametreCadre: 6, boardId: 'p4_20' });
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase">
                    <Grid size={16} className="text-blue-600" /> Poutre / Chaînage
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Longueur (m)</label>
                        <input type="number" placeholder="L (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, longueur: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Aciers</label>
                        <select className="w-full p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.diametre} onChange={e => setTemp({ ...temp, diametre: parseInt(e.target.value) })}>
                            {[8, 10, 12, 14, 16].map(d => <option key={d} value={d}>Φ {d}mm</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Largeur (m)</label>
                        <input type="number" placeholder="l (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, sectionL: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Hauteur (m)</label>
                        <input type="number" placeholder="h (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, sectionH: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Planche de Coffrage</label>
                        <select className="w-full p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.boardId} onChange={e => setTemp({ ...temp, boardId: e.target.value })}>
                            {BOARD_TYPES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> AJOUTER POUTRE</button>
            </div>
        );
    };

    const AddMur = ({ onAdd, brickWaste, onUpdateWaste }) => {
        const [temp, setTemp] = useState({ longueur: 0, hauteur: 0, ouvertures: 0, briqueId: 'b15' });

        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase">
                        <Square size={16} className="text-red-600" /> Mur en Briques
                    </h3>
                    <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded text-[10px]">
                        <span className="text-red-600 font-bold">Perte:</span>
                        <input
                            type="number"
                            className="w-8 bg-transparent border-b border-red-200 text-center font-bold text-red-700 focus:outline-none"
                            value={brickWaste !== undefined ? brickWaste : 5}
                            onChange={(e) => onUpdateWaste && onUpdateWaste(e.target.value)}
                        />
                        <span className="text-red-600">%</span>
                    </div>
                </div>

                <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                    {BRICK_TYPES.map((b) => (
                        <button key={b.id} onClick={() => setTemp({ ...temp, briqueId: b.id })} className={`whitespace-nowrap px-3 py-1.5 rounded-full border text-[10px] font-black transition-all ${temp.briqueId === b.id ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{b.label}</button>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">L (m)</label>
                        <input type="number" placeholder="L (m)" className="w-full p-2 bg-gray-50 border rounded text-xs outline-red-500" onChange={e => setTemp({ ...temp, longueur: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">H (m)</label>
                        <input type="number" placeholder="H (m)" className="w-full p-2 bg-gray-50 border rounded text-xs outline-red-500" onChange={e => setTemp({ ...temp, hauteur: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div>
                        <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Vides (m²)</label>
                        <input type="number" placeholder="Vides (m²)" className="w-full p-2 bg-gray-50 border rounded text-xs outline-red-500" onChange={e => setTemp({ ...temp, ouvertures: parseFloat(e.target.value) || 0 })} />
                    </div>
                </div>
                <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-red-600 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> AJOUTER MUR</button>
            </div>
        );
    };

    const AddDalle = ({ onAdd }) => {
        const [temp, setTemp] = useState({ longueur: 4, largeur: 4, epaisseur: 0.15, diametre: 10, maille: 0.20, boardId: 'p4_20', espacementEtaiement: 0.60 });
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase">
                    <Layout size={16} className="text-purple-600" /> Dalle Béton
                </h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase">Dimensions (m)</label>
                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <label className="text-[8px] text-gray-400 font-bold uppercase block">L (m)</label>
                                <input type="number" placeholder="L (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, longueur: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-[8px] text-gray-400 font-bold uppercase block">l (m)</label>
                                <input type="number" placeholder="l (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, largeur: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[8px] text-gray-400 font-bold uppercase block">Épaisseur (m)</label>
                            <input type="number" step="0.01" placeholder="Epaisseur (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, epaisseur: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase">Ferraillage</label>
                        <div>
                            <label className="text-[8px] text-gray-400 font-bold uppercase block">Diamètre</label>
                            <select className="w-full p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.diametre} onChange={e => setTemp({ ...temp, diametre: parseInt(e.target.value) })}>
                                {[8, 10, 12, 14].map(d => <option key={d} value={d}>Φ {d}mm</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] text-gray-400 font-bold uppercase block">Maille</label>
                            <select className="w-full p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.maille} onChange={e => setTemp({ ...temp, maille: parseFloat(e.target.value) })}>
                                <option value="0.15">Maille 15x15</option>
                                <option value="0.20">Maille 20x20</option>
                                <option value="0.25">Maille 25x25</option>
                                <option value="0.30">Maille 30x30</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] text-gray-400 font-bold uppercase block">Coffrage</label>
                            <select className="w-full p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.boardId} onChange={e => setTemp({ ...temp, boardId: e.target.value })}>
                                {BOARD_TYPES.map(b => (
                                    <option key={b.id} value={b.id}>{b.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[8px] text-gray-400 font-bold uppercase block">Espacement Étais (m)</label>
                            <input type="number" step="0.05" placeholder="Esp. Étai (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.espacementEtaiement} onChange={e => setTemp({ ...temp, espacementEtaiement: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>
                </div>
                <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> AJOUTER DALLE</button>
            </div>
        );
    };

    const AddToiture = ({ onAdd }) => {
        const [temp, setTemp] = useState({ surfaceAuSol: 0, penteDeg: 15 });
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase">
                    <RoofIcon size={16} className="text-cyan-600" /> Calcul de Toiture
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase">Surface au sol (m²)</label>
                        <input type="number" placeholder="Ex: 100" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, surfaceAuSol: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase">Pente (Degrés)</label>
                        <input type="number" placeholder="Ex: 15" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.penteDeg} onChange={e => setTemp({ ...temp, penteDeg: parseFloat(e.target.value) || 0 })} />
                    </div>
                </div>
                <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-cyan-600 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> DÉFINIR LA TOITURE</button>
            </div>
        );
    };

    const AddCarrelage = ({ onAdd }) => {
        const [temp, setTemp] = useState({ longueur: 4, largeur: 4, tileId: 't60' });
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase">
                    <Grid size={16} className="text-emerald-600" /> Carrelage
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase">Dimensions Pièce</label>
                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <label className="text-[8px] text-gray-400 font-bold uppercase block">Longueur (m)</label>
                                <input type="number" placeholder="L (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, longueur: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div>
                                <label className="text-[8px] text-gray-400 font-bold uppercase block">Largeur (m)</label>
                                <input type="number" placeholder="l (m)" className="w-full p-2 bg-gray-50 border rounded text-xs" onChange={e => setTemp({ ...temp, largeur: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase">Type de Carreau</label>
                        <select className="w-full p-2 bg-gray-50 border rounded text-xs font-bold" value={temp.tileId} onChange={e => setTemp({ ...temp, tileId: e.target.value })}>
                            {TILE_TYPES.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> AJOUTER PIÈCE</button>
            </div>
        );
    };

    const ResultsSummary = ({ totals }) => (
        <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Résultats en Direct (Calcul Rapide)</h3>
            <div className="grid grid-cols-2 gap-3">
                <StatCard title="Ciment" value={totals.ciment} unit="Sacs" color="bg-blue-600" />
                <StatCard title="Briques" value={totals.briques} unit="Unités" color="bg-red-600" />
                <StatCard title="Sable" value={totals.sable} unit="m³" color="bg-amber-500" />
                <StatCard title="Gravier" value={totals.gravier} unit="m³" color="bg-zinc-500" />
            </div>
        </div>
    );

    const ProjectsView = () => {
        // Use parent's projectViewMode instead of local state
        const viewMode = projectViewMode;
        const setViewMode = setProjectViewMode;

        const buildingTypes = [
            { id: 'Maison', label: 'Maison', icon: '🏠' },
            { id: 'Restaurant', label: 'Restaurant', icon: '🍴' },
            { id: 'Immeuble', label: 'Immeuble', icon: '🏢' },
            { id: 'Bureau', label: 'Bureau', icon: '🏛️' },
            { id: 'Entrepôt', label: 'Entrepôt', icon: '🏭' },
            { id: 'Autre', label: 'Autre', icon: '🏗️' }
        ];

        const getTypeIcon = (type) => {
            const found = buildingTypes.find(t => t.id === type);
            return found ? found.icon : '🏗️';
        };

        const handleCreateNew = () => {
            // Reset Global Project State
            setProject({
                semelles: [],
                poteaux: [],
                poutres: [],
                murs: [],
                dalles: [],
                toiture: null,
                carrelage: [],
                escaliers: [],
                divers: []
            });
            setTotals({
                ciment: 0,
                sable: 0,
                gravier: 0,
                briques: 0,
                acier: 0,
                coffrage: 0,
                toles: 0,
                chevrons: 0,
                surfaceCarrelage: 0,
                nbCarreaux: 0
            });
            setProjectName('');
            setProjectType('Maison');
            setProjectFloors(1);
            setProjectRooms(1);
            setActiveConstructionForms([]);

            setViewMode('editor');
        };

        const handleLoadWrapper = (p) => {
            handleLoadProject(p);
            setViewMode('editor');
        };

        const handleSaveWrapper = () => {
            handleSaveProject();
            // Only switch if save was successful (simple check: if name was provided, handleSaveProject alerts success, strict check would need return value but this is acceptable for now)
            if (projectName.trim()) {
                setViewMode('list');
            }
        };

        // --- DASHBOARD VIEW ---
        if (viewMode === 'list') {
            return (
                <div className="p-4 space-y-6 pb-32">
                    <header className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <HardHat size={28} className="text-blue-600" />
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Mes Projets</h2>
                        </div>
                    </header>

                    {/* CREATE NEW CARD */}
                    <button
                        onClick={handleCreateNew}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Créer un nouveau projet</h3>
                            <p className="text-blue-100 text-xs mt-1">Commencer un nouveau calcul de matériaux</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                            <Plus size={24} />
                        </div>
                    </button>

                    {/* SAVED LIST */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Projets Enregistrés ({savedProjects.length})</h3>
                        {savedProjects.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm">Aucun projet sauvegardé.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {savedProjects.map(p => (
                                    <div key={p.id} onClick={() => handleLoadWrapper(p)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 p-3 rounded-lg text-blue-600 text-xl">
                                                {getTypeIcon(p.type)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{p.name}</h4>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{p.type}</span>
                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">{p.totalMat}</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium mt-1">{p.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProject(p.id);
                                                }}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            );
        }

        // --- EDITOR VIEW (Existing Content) ---
        return (
            <div className="p-4 space-y-4 pb-32">
                <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2 mb-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className="mr-2 text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight">Éditeur de Projet</h2>
                    </div>
                    <button
                        onClick={handleSaveWrapper}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Save size={16} /> SAUVEGARDER
                    </button>
                </div>

                {/* RESULTS SUMMARY */}
                <ResultsSummary totals={totals} />

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Nom du projet..."
                            className="w-full p-2 bg-white border border-blue-200 rounded text-xs"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                        />

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className="text-[9px] text-blue-700 font-bold uppercase block mb-1">Type</label>
                                <select
                                    className="w-full p-2 bg-white border border-blue-200 rounded text-xs font-bold"
                                    value={projectType}
                                    onChange={(e) => setProjectType(e.target.value)}
                                >
                                    {buildingTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] text-blue-700 font-bold uppercase block mb-1">Étages</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 bg-white border border-blue-200 rounded text-xs"
                                    value={projectFloors}
                                    onChange={(e) => setProjectFloors(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] text-blue-700 font-bold uppercase block mb-1">Pièces</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="w-full p-2 bg-white border border-blue-200 rounded text-xs"
                                    value={projectRooms}
                                    onChange={(e) => setProjectRooms(parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Construction Forms Section - Selective */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                        <Calculator size={16} className="text-blue-600" /> Éléments de construction
                    </h3>

                    {/* Selector Buttons */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {[
                            { id: 'semelles', label: 'Fondations', icon: '🏗️' },
                            { id: 'poteaux', label: 'Poteaux', icon: '⚫' },
                            { id: 'poutres', label: 'Poutres', icon: '➖' },
                            { id: 'murs', label: 'Murs', icon: '🧱' },
                            { id: 'dalles', label: 'Béton/Dalles', icon: '⬜' },
                            { id: 'toiture', label: 'Toiture', icon: '🏠' }
                        ].map(item => {
                            const isActive = activeConstructionForms.includes(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (isActive) {
                                            setActiveConstructionForms(activeConstructionForms.filter(f => f !== item.id));
                                        } else {
                                            setActiveConstructionForms([...activeConstructionForms, item.id]);
                                        }
                                    }}
                                    className={`p-2 rounded-lg text-xs font-bold transition-all ${isActive
                                        ? 'bg-blue-600 text-white shadow-md scale-105'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <span className="block text-sm mb-1">{item.icon}</span>
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Dynamic Forms Display */}
                    <div className="space-y-3">
                        {activeConstructionForms.length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-xs">
                                Sélectionnez un élément ci-dessus pour commencer
                            </div>
                        ) : (
                            <>
                                {activeConstructionForms.includes('semelles') && <AddSemelle onAdd={(item) => setProject({ ...project, semelles: [...project.semelles, item] })} />}
                                {activeConstructionForms.includes('poteaux') && <AddPoteau onAdd={(item) => setProject({ ...project, poteaux: [...project.poteaux, item] })} />}
                                {activeConstructionForms.includes('poutres') && <AddPoutre onAdd={(item) => setProject({ ...project, poutres: [...project.poutres, item] })} />}
                                {activeConstructionForms.includes('murs') && <AddMur onAdd={(item) => setProject({ ...project, murs: [...project.murs, item] })} brickWaste={project.brickWaste} onUpdateWaste={(waste) => setProject({ ...project, brickWaste: parseFloat(waste) })} />}
                                {activeConstructionForms.includes('dalles') && <AddDalle onAdd={(item) => setProject({ ...project, dalles: [...project.dalles, item] })} />}
                                {activeConstructionForms.includes('toiture') && <AddToiture onAdd={(item) => setProject({ ...project, toiture: item })} />}
                            </>
                        )}
                    </div>
                </div>

                {/* RECAPITULATIF PROJET */}
                <div className="space-y-2 mt-6">
                    <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">Récapitulatif</h3>
                    {project.semelles.map((s, i) => (
                        <ListItem key={`s-${i}`} title="Semelle Isolée" details={`${s.longueur}x${s.largeur}m | Φ${s.diametre}`} color="border-blue-500" onRemove={() => {
                            const news = [...project.semelles]; news.splice(i, 1); setProject({ ...project, semelles: news });
                        }} />
                    ))}
                    {project.poteaux.map((p, i) => {
                        const q = p.quantity || 1;
                        const perimetre = (p.sectionL + p.sectionl) * 2;
                        const surface = perimetre * p.hauteur * q;
                        const board = BOARD_TYPES.find(b => b.id === p.boardId) || BOARD_TYPES[2];
                        const nbPlanches = Math.ceil((surface * 1.1) / (board.l * board.w));
                        return (
                            <ListItem key={`pot-${i}`} title="Poteau" details={`${q > 1 ? q + 'x ' : ''}H:${p.hauteur}m (${p.sectionL}x${p.sectionl}) | ${nbPlanches} Planches | ${p.nbBarres} Barres Φ${p.diametre}`} color="border-gray-500" onRemove={() => {
                                const newp = [...project.poteaux]; newp.splice(i, 1); setProject({ ...project, poteaux: newp });
                            }} />
                        );
                    })}
                    {project.poutres.map((p, i) => {
                        const surfacePoutre = (p.sectionL + (2 * p.sectionH)) * p.longueur;
                        const board = (typeof BOARD_TYPES !== 'undefined' ? BOARD_TYPES.find(b => b.id === p.boardId) : null) || { l: 4, w: 0.2 };
                        const nbPlanches = Math.ceil((surfacePoutre * 1.1) / (board.l * board.w));

                        return (
                            <ListItem key={`p-${i}`} title="Poutre" details={`L: ${p.longueur}m | ${nbPlanches} Planches (${board.l}m x ${board.w * 100}cm)`} color="border-orange-500" onRemove={() => {
                                const newp = [...project.poutres]; newp.splice(i, 1); setProject({ ...project, poutres: newp });
                            }} />
                        );
                    })}
                    {project.murs.map((m, i) => (
                        <ListItem key={`m-${i}`} title={`Mur ${BRICK_TYPES.find(b => b.id === m.briqueId)?.label}`} details={`${m.longueur}x${m.hauteur}m`} color="border-red-500" onRemove={() => {
                            const newm = [...project.murs]; newm.splice(i, 1); setProject({ ...project, murs: newm });
                        }} />
                    ))}
                    {project.dalles.map((d, i) => {
                        const surface = d.longueur * d.largeur;
                        const board = BOARD_TYPES.find(b => b.id === (d.boardId || 'p4_20')) || BOARD_TYPES[2];
                        const nbPlanches = Math.ceil(surface / (board.l * board.w));
                        const espac = d.espacementEtaiement || 0.60;
                        const chev = (Math.ceil(d.longueur / espac) + 1) * (Math.ceil(d.largeur / espac) + 1);

                        return (
                            <ListItem key={`d-${i}`} title="Dalle Béton" details={`${d.longueur}x${d.largeur}x${d.epaisseur}m | ${surface.toFixed(2)}m² | ${nbPlanches} Planches | ${chev} Chevrons`} color="border-purple-500" onRemove={() => {
                                const newd = [...project.dalles]; newd.splice(i, 1); setProject({ ...project, dalles: newd });
                            }} />
                        );
                    })}
                    {project.escaliers.map((e, i) => (
                        <ListItem key={`esc-${i}`} title="Escalier Béton" details={`H:${e.hauteur}m | ${e.nbMarches} marches | ${e.volume}m³`} color="border-orange-500" onRemove={() => {
                            const newEsc = [...project.escaliers]; newEsc.splice(i, 1); setProject({ ...project, escaliers: newEsc });
                        }} />
                    ))}
                    {project.divers.map((d, i) => {
                        const q = d.quantity || 1;
                        const details = `${q > 1 ? q + 'x ' : ''}${d.longueur}x${d.largeur}x${d.epaisseur}m | ${d.dosage}kg/m³${d.isReinforced ? ' | ARMÉ' : ''}`;

                        return (
                            <ListItem key={`div-${i}`} title={d.label || "Divers Béton"} details={details} color="border-pink-500" onRemove={() => {
                                const newd = [...project.divers]; newd.splice(i, 1); setProject({ ...project, divers: newd });
                            }} />
                        );
                    })}
                    {project.toiture && (
                        <ListItem title="Toiture" details={`${project.toiture.surfaceAuSol}m² au sol | Pente ${project.toiture.penteDeg}°`} color="border-cyan-500" onRemove={() => setProject({ ...project, toiture: null })} />
                    )}
                    {project.carrelage.map((c, i) => {
                        const surface = c.longueur * c.largeur;
                        const tile = TILE_TYPES.find(t => t.id === c.tileId) || TILE_TYPES[4];
                        const nb = Math.ceil((surface * 1.05) / (tile.l * tile.w));
                        return (
                            <ListItem key={`c-${i}`} title="Carrelage Pièce" details={`${c.longueur}x${c.largeur}m (${surface}m²) | ${nb} Carreaux (${tile.label})`} color="border-emerald-500" onRemove={() => {
                                const newc = [...project.carrelage]; newc.splice(i, 1); setProject({ ...project, carrelage: newc });
                            }} />
                        );
                    })}
                </div>
            </div>
        );
    };

    // ProfileMenu component removed - profile icon now in TopNavbar

    const AuthModal = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);

        if (!showAuthModal) return null;

        const handleSubmit = async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);

            try {
                if (authMode === 'login') {
                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                    if (error) throw error;
                    setShowAuthModal(false);
                } else {
                    const { error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                name: email.split('@')[0]
                            }
                        }
                    });
                    if (error) throw error;
                    alert('Inscription réussie ! Vérifiez vos emails pour confirmer.');
                    setShowAuthModal(false);
                    setAuthMode('login');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                                {authMode === 'login' ? 'Connexion' : 'Inscription'}
                            </h2>
                            <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-xs font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-pink-500 transition-colors"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-pink-500 transition-colors"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-pink-200 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Chargement...' : (authMode === 'login' ? 'Se connecter' : "S'inscrire")}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 font-medium">
                                {authMode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                                <button
                                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                    className="ml-1 text-pink-600 font-bold hover:underline"
                                >
                                    {authMode === 'login' ? "S'inscrire" : "Se connecter"}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ForumView = () => {
        const [tempMsg, setTempMsg] = useState('');
        const [filterCategory, setFilterCategory] = useState('All');
        const [topics, setTopics] = useState([]);
        const [loading, setLoading] = useState(true);

        // New Topic Form State
        const [newTopicTitle, setNewTopicTitle] = useState('');
        const [newTopicCategory, setNewTopicCategory] = useState('Général');
        const [newTopicContent, setNewTopicContent] = useState('');

        const categories = ['All', 'Général', 'Chantier', 'Prix', 'Artisans', 'SOS'];

        useEffect(() => {
            fetchTopics();
        }, []);

        // Real-time subscription could be added here later
        const fetchTopics = async () => {
            try {
                const { data, error } = await supabase
                    .from('topics')
                    .select('*, author:author_id(username, id)')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Fetch stats for each topic (msg count) could be a separate query or join, 
                // for now we'll fetch messages count simply or just fetch all messages for active topic.
                // To keep it simple in this list view, we might not have msg count unless we join messages.
                // Let's refine the query to include messages count if possible or just map standard data.
                // Supabase doesn't natively do count in select easily without a view or rpc. 
                // We'll just fetch topics for now and maybe fetch counts later or separate.

                // MAPPING to frontend structure
                const mappedTopics = await Promise.all(data.map(async (t) => {
                    const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('topic_id', t.id);
                    return {
                        id: t.id,
                        title: t.title,
                        author: t.author?.username || 'Anonyme',
                        category: t.category,
                        date: new Date(t.created_at).toLocaleDateString('fr-FR'),
                        likes: 0,
                        replies: count || 0,
                        tags: [t.category],
                        messages: [] // loaded on detail view
                    };
                }));
                setTopics(mappedTopics);
            } catch (err) {
                console.error("Error fetching topics:", err);
            } finally {
                setLoading(false);
            }
        };

        const handleCreateTopic = async () => {
            if (!currentUser) return setShowAuthModal(true);
            if (!newTopicTitle.trim() || !newTopicContent.trim()) return;

            try {
                // 1. Create Topic
                const { data: topicData, error: topicError } = await supabase
                    .from('topics')
                    .insert({
                        title: newTopicTitle,
                        category: newTopicCategory,
                        author_id: (await supabase.auth.getUser()).data.user.id
                    })
                    .select()
                    .single();

                if (topicError) throw topicError;

                // 2. Create Initial Message
                const { error: msgError } = await supabase
                    .from('messages')
                    .insert({
                        topic_id: topicData.id,
                        content: newTopicContent,
                        author_id: (await supabase.auth.getUser()).data.user.id
                    });

                if (msgError) throw msgError;

                // Refresh list
                await fetchTopics();
                setNewTopicTitle('');
                setNewTopicContent('');
                setForumViewMode('list');
            } catch (err) {
                console.error("Error creating topic:", err);
                alert("Erreur lors de la création du sujet.");
            }
        };

        const activeTopicData = topics.find(t => t.id === activeTopicId);

        // Fetch messages for active topic
        const [activeMessages, setActiveMessages] = useState([]);
        useEffect(() => {
            if (forumViewMode === 'detail' && activeTopicId) {
                fetchMessages(activeTopicId);
            }
        }, [forumViewMode, activeTopicId]);

        const fetchMessages = async (topicId) => {
            const { data, error } = await supabase
                .from('messages')
                .select('*, author:author_id(username)')
                .eq('topic_id', topicId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                const myId = (await supabase.auth.getUser()).data.user?.id;
                setActiveMessages(data.map(m => ({
                    id: m.id,
                    author: m.author?.username || 'Anonyme',
                    text: m.content,
                    time: new Date(m.created_at).toLocaleString('fr-FR'),
                    isMe: false, // We can't easily check auth.uid in mapped response without session check, handled below
                    // color logic simplified
                    color: 'bg-gray-100 text-gray-600',
                    avatar: (m.author?.username || 'A').charAt(0).toUpperCase()
                })));

                // Post-process for isMe
                checkIsMe(data);
            }
        };

        const checkIsMe = async (messages) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setActiveMessages(prev => prev.map((m, i) => ({
                    ...m,
                    isMe: messages[i].author_id === user.id,
                    color: messages[i].author_id === user.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                })));
            }
        }

        const handlePostMessage = async () => {
            if (!currentUser) return setShowAuthModal(true);
            if (!tempMsg.trim()) return;

            try {
                const { error } = await supabase
                    .from('messages')
                    .insert({
                        topic_id: activeTopicId,
                        content: tempMsg,
                        author_id: (await supabase.auth.getUser()).data.user.id
                    });

                if (error) throw error;
                setTempMsg('');
                fetchMessages(activeTopicId); // Refresh chat
            } catch (err) {
                console.error("Error posting message:", err);
            }
        };

        const activeTopic = activeTopicData ? { ...activeTopicData, messages: activeMessages } : null;

        // --- CREATE TOPIC VIEW ---
        if (forumViewMode === 'create') {
            return (
                <div className="p-4 pb-24 space-y-4 h-full">
                    <div className="flex items-center gap-2 border-b-2 border-pink-600 pb-2">
                        <button onClick={() => setForumViewMode('list')} className="text-pink-600"><ChevronLeft size={24} /></button>
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Nouveau Sujet</h2>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Titre du sujet</label>
                            <input
                                type="text"
                                placeholder="Ex: Quel dosage pour..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-pink-500 transition-colors"
                                value={newTopicTitle}
                                onChange={e => setNewTopicTitle(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Catégorie</label>
                            <div className="flex gap-2 flex-wrap">
                                {categories.filter(c => c !== 'All').map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setNewTopicCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${newTopicCategory === cat ? 'bg-pink-600 text-white shadow-md scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Votre Message</label>
                            <textarea
                                placeholder="Expliquez votre problème..."
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm min-h-[150px] focus:outline-none focus:border-pink-500 transition-colors resize-none"
                                value={newTopicContent}
                                onChange={e => setNewTopicContent(e.target.value)}
                            />
                        </div>


                        {/* Modified: Only show button for connecting if strictly needed, but form is behind auth guard on list view anyway. 
                            Actually, we want to show the form but block SUBMIT based on auth? 
                            User said: "les pouton poser question doit etre visible mais si on clique un pop up qui demande a l'utisateur des se connecte"
                            So in List View, the button triggers auth.
                            If we are HERE in Create View, user MUST be logged in. 
                            Let's add a redirect or strict check if somehow they got here without auth.
                         */
                        }


                        <button
                            onClick={handleCreateTopic}
                            disabled={!newTopicTitle.trim() || !newTopicContent.trim()}
                            className="w-full bg-pink-600 text-white p-4 rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-pink-200 hover:bg-pink-700 active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Publier la discussion
                        </button>
                    </div>
                </div>
            );
        }

        // --- DETAIL TOPIC VIEW (CHAT) ---
        if (forumViewMode === 'detail' && activeTopic) {
            return (
                <div className="p-4 pb-24 space-y-4 h-screen flex flex-col relative">
                    <div className="flex justify-between items-center border-b-2 border-pink-600 pb-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <button onClick={() => setForumViewMode('list')} className="text-pink-600 shrink-0"><ChevronLeft size={24} /></button>
                            <div>
                                <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate max-w-[200px]">{activeTopic.title}</h2>
                                <p className="text-[10px] text-gray-500 font-bold">{activeTopic.category}</p>
                            </div>
                        </div>
                        {/* Remove redundant login link since actions trigger it now */}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                        {/* Topic Header in Chat */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center mb-4">
                            <span className="bg-white border border-gray-200 px-2 py-1 rounded-md text-[10px] font-bold text-gray-500 uppercase tracking-widest">{activeTopic.date}</span>
                            <p className="mt-2 text-xs text-gray-600 italic">Discussion démarrée par <span className="font-bold">{activeTopic.author}</span></p>
                        </div>

                        {activeTopic.messages.map(msg => (
                            <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`p-3 rounded-xl border shadow-sm max-w-[85%] ${msg.isMe ? 'bg-blue-50 border-blue-100 rounded-tr-none' : 'bg-white border-gray-100 rounded-tl-none ml-2'}`}>
                                    {!msg.isMe && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${msg.color} border border-white shadow-sm`}>{msg.avatar}</div>
                                            <span className="text-[10px] font-bold text-gray-900">{msg.author}</span>
                                        </div>
                                    )}
                                    <p className={`text-[11px] font-medium leading-relaxed ${msg.isMe ? 'text-blue-900' : 'text-gray-600'}`}>
                                        {msg.text}
                                    </p>
                                    <div className={`mt-1 text-[9px] font-bold uppercase ${msg.isMe ? 'text-blue-400 text-right' : 'text-gray-400'}`}>
                                        <span>{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* User Input Area */}
                    <div className="pt-2">
                        {/* Input Area is always visible, but protected on interaction */}
                        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-lg flex gap-2">
                            <input
                                type="text"
                                placeholder={currentUser ? `Répondre en tant que ${currentUser.name}...` : "Connectez-vous pour répondre..."}
                                className="flex-1 bg-gray-50 p-2 rounded-lg text-xs outline-none focus:bg-white transition-colors"
                                value={tempMsg}
                                onChange={e => setTempMsg(e.target.value)}
                                onFocus={() => !currentUser && setShowAuthModal(true)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handlePostMessage();
                                }}
                            />
                            <button onClick={handlePostMessage} className="bg-pink-600 text-white p-2 rounded-lg shadow-md active:scale-95 transition-transform"><Share2 size={16} /></button>
                        </div>
                    </div>
                </div>
            );
        }

        // --- LIST VIEW (DEFAULT) ---
        const filteredTopics = filterCategory === 'All' ? topics : topics.filter(t => t.category === filterCategory);

        return (
            <div className="p-4 pb-32 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                            <MessageSquare className="text-pink-600" size={28} />
                            Forum
                        </h2>
                        <p className="text-xs text-gray-500 font-bold ml-1">L'entraide entre pros & particuliers</p>
                    </div>
                    {/* Removed top login link */}
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterCategory === cat
                                ? 'bg-gray-900 text-white shadow-lg scale-105'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Create Topic Button - INTERCEPTED to show AuthModal if not logged in */}
                <button
                    onClick={() => {
                        if (!currentUser) {
                            setShowAuthModal(true);
                        } else {
                            setForumViewMode('create');
                        }
                    }}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white p-4 rounded-2xl shadow-lg shadow-pink-200 flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                    <div className="text-left">
                        <h3 className="font-bold text-lg">Poser une question</h3>
                        <p className="text-pink-100 text-xs mt-0.5">La communauté vous répondra !</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full">
                        <Plus size={24} />
                    </div>
                </button>

                {/* Topic List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Discussions ({filteredTopics.length})
                    </h3>

                    {filteredTopics.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 text-sm">Aucune discussion dans cette catégorie.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredTopics.map(topic => (
                                <div
                                    key={topic.id}
                                    onClick={() => { setActiveTopicId(topic.id); setForumViewMode('detail'); }}
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${topic.category === 'Chantier' ? 'bg-orange-100 text-orange-600' :
                                                topic.category === 'Prix' ? 'bg-green-100 text-green-600' :
                                                    topic.category === 'SOS' ? 'bg-red-100 text-red-600' :
                                                        'bg-blue-50 text-blue-600'
                                                }`}>
                                                {topic.category}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">{topic.date}</span>
                                    </div>

                                    <h4 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-pink-600 transition-colors">{topic.title}</h4>

                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-600">
                                                {topic.author.charAt(0)}
                                            </div>
                                            {topic.author}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400 text-xs font-bold">
                                            <span className="flex items-center gap-1"><MessageSquare size={14} /> {topic.replies}</span>
                                            {/* <span className="flex items-center gap-1"><Heart size={14} /> {topic.likes}</span> */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const PlusView = () => {
        // Using viewMode and setPlusViewMode from App scope

        const handleShare = async () => {
            const shareData = {
                title: 'BatiCalcul',
                text: 'Découvrez BatiCalcul, l\'application ultime pour vos chantiers BTP !',
                url: window.location.href
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Lien copié dans le presse-papier !');
                }
            } catch (err) {
                console.error('Error sharing:', err);
            }
        };

        const AboutView = () => (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 border-b-2 border-purple-600 pb-2">
                    <button onClick={() => setPlusViewMode('menu')} className="text-purple-600"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">À Propos</h2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-lg font-black text-purple-600 mb-2">BatiCalcul</h3>
                        <p className="text-sm text-gray-600 leading-relaxed text-justify">
                            BatiCalcul est une plateforme numérique dédiée au secteur du BTP qui facilite le dimensionnement, l'estimation, la gestion de chantier et la planification des travaux, tout en favorisant la collaboration entre les différents acteurs du bâtiment.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                            <TrendingUp size={16} className="text-purple-500" /> Objectifs
                        </h4>
                        <ul className="space-y-2">
                            {[
                                "Simplifier les calculs techniques et le dimensionnement.",
                                "Permettre l'estimation du coût et des matériaux.",
                                "Améliorer le suivi et l'organisation des chantiers.",
                                "Faciliter la planification et la collaboration.",
                                "Favoriser l'échange d'expérience entre professionnels."
                            ].map((item, i) => (
                                <li key={i} className="flex gap-2 text-xs text-gray-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                            <User size={16} className="text-purple-500" /> Pour Qui ?
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Architectes, Ingénieurs BTP, Plombiers, Maçons, Ferrailleurs, Conducteurs de travaux, Électriciens, Entrepreneurs et Artisans du bâtiment.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2 flex items-center gap-2">
                            <HardHat size={16} className="text-purple-500" /> Services
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                "Calcul et dimensionnement des structures",
                                "Estimation des quantités et coûts",
                                "Gestion et suivi des chantiers",
                                "Planification et organisation des travaux",
                                "Communication et collaboration",
                                "Partage de solutions techniques"
                            ].map((item, i) => (
                                <div key={i} className="bg-purple-50 px-3 py-2 rounded-lg text-xs font-medium text-purple-700 border border-purple-100">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );

        const SettingsView = () => (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 border-b-2 border-gray-600 pb-2">
                    <button onClick={() => setPlusViewMode('menu')} className="text-gray-600"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Paramètres</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Notifications</span>
                        <div className="w-10 h-6 bg-green-500 rounded-full relative cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Mode Sombre</span>
                        <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Unités (Métrique)</span>
                        <span className="text-xs text-gray-400 font-bold">m, cm, mm</span>
                    </div>
                </div>
                <div className="text-center text-xs text-gray-400 mt-8">
                    ID App: {Date.now().toString().slice(-6)}
                </div>
            </div>
        );

        const LegalView = () => (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 border-b-2 border-gray-600 pb-2">
                    <button onClick={() => setPlusViewMode('menu')} className="text-gray-600"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Mentions Légales</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 text-xs text-gray-600 text-justify">
                    <p><strong>Éditeur :</strong> BatiCalcul est une application développée à titre personnel.</p>
                    <p><strong>Hébergement :</strong> Ce site est hébergé sur GitHub Pages.</p>

                    <p><strong>Données Personnelles :</strong> Les données de vos projets sont stockées localement sur votre appareil (LocalStorage). Aucune donnée n'est envoyée vers un serveur distant, sauf si vous utilisez les fonctionnalités de partage.</p>
                </div>
            </div>
        );

        const HelpView = () => (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-2 border-b-2 border-emerald-600 pb-2">
                    <button onClick={() => setPlusViewMode('menu')} className="text-emerald-600"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Aide & Support</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
                    <h3 className="font-bold text-emerald-800 text-sm">Besoin d'aide ?</h3>
                    <p className="text-xs text-gray-600">
                        Si vous rencontrez un problème ou avez une question sur l'utilisation de l'application, n'hésitez pas à nous contacter.
                    </p>
                    <div className="grid gap-2">
                        <button className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-bold text-left flex items-center gap-2">
                            <MessageSquare size={16} /> FAQ (Foire Aux Questions)
                        </button>
                        <button className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-bold text-left flex items-center gap-2">
                            <FileText size={16} /> Guide d'utilisation
                        </button>
                        <a href="mailto:support@baticalcul.com" className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-xs font-bold text-left flex items-center justify-between">
                            <span className="flex items-center gap-2"><Settings2 size={16} /> Contacter le support</span>
                        </a>
                    </div>
                </div>
            </div>
        );

        const ProfileView = () => (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 h-full">
                <div className="flex items-center gap-2 border-b-2 border-pink-600 pb-2">
                    <button onClick={() => setPlusViewMode('menu')} className="text-pink-600"><ChevronLeft size={24} /></button>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Mon Profil</h2>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-pink-100 shadow-sm flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl ring-4 ring-pink-50">
                        {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-black text-gray-800">{currentUser?.name || 'Utilisateur'}</h3>
                        <p className="text-sm text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-full mt-2 inline-block">Membre BatiCalcul</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button className="w-full bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-3 text-gray-700 font-bold"><User size={20} className="text-gray-400" /> Modifier le profil</span>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                    <button className="w-full bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-3 text-gray-700 font-bold"><Settings2 size={20} className="text-gray-400" /> Préférences</span>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>

                    <button onClick={async () => { await supabase.auth.signOut(); setCurrentUser(null); setActiveTab('dashboard'); }} className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors mt-8 shadow-sm">
                        <LogOut size={20} />
                        Se déconnecter
                    </button>
                </div>
            </div>
        );


        if (plusViewMode === 'about') return <div className="p-4 pb-24 h-full"><AboutView /></div>;
        if (plusViewMode === 'settings') return <div className="p-4 pb-24 h-full"><SettingsView /></div>;
        if (plusViewMode === 'legal') return <div className="p-4 pb-24 h-full"><LegalView /></div>;
        if (plusViewMode === 'help') return <div className="p-4 pb-24 h-full"><HelpView /></div>;
        if (plusViewMode === 'profile') return <div className="p-4 pb-24 h-full"><ProfileView /></div>;

        return (
            <div className="p-4 space-y-6 pb-32">
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight border-b-2 border-purple-600 w-fit pr-4">Plus d'options</h2>

                <div className="space-y-2">
                    {currentUser && <MenuItem icon={<User size={18} />} label="Mon Profil" color="text-pink-600" onClick={() => setPlusViewMode('profile')} />}
                    <MenuItem icon={<Settings2 size={18} />} label="Paramètres de l'application" color="text-gray-600" onClick={() => setPlusViewMode('settings')} />
                    <MenuItem icon={<Info size={18} />} label="À Propos de BatiCalcul" color="text-purple-600" onClick={() => setPlusViewMode('about')} />
                    <MenuItem icon={<Share2 size={18} />} label="Partager BatiCalcul" color="text-blue-600" onClick={handleShare} />
                    <MenuItem icon={<FileText size={18} />} label="Mentions Légales & CGU" color="text-gray-600" onClick={() => setPlusViewMode('legal')} />
                    <MenuItem icon={<HelpCircle size={18} />} label="Aide & Support" color="text-emerald-600" onClick={() => setPlusViewMode('help')} />
                </div>

                {/* Creator Card */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                        <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-lg">
                            JM
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-gray-800 text-sm">Créé par Jeancy Mifundu</h3>
                            <p className="text-[10px] text-blue-600 font-medium">Membre du BenevolApp</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                        Pour tous commentaires et suggestions, contactez-le :
                    </p>
                    <a
                        href="https://wa.me/243905271744"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-full font-bold text-xs shadow-md active:scale-95 transition-transform"
                    >
                        <MessageSquare size={16} />
                        CONTACTER VIA WHATSAPP
                    </a>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
                    <h3 className="font-black text-purple-800 text-sm mb-1">Version 1.0.0</h3>
                    <p className="text-[10px] text-purple-600 mb-3">Soutenez le développement de BatiCalcul !</p>
                    <button onClick={() => alert("Cette fonctionnalité sera bientôt disponible !")} className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold text-xs shadow-lg shadow-purple-200 active:scale-95 transition-transform">💝 FAIRE UN DON</button>
                </div>
            </div>
        );
    };

    const MenuItem = ({ icon, label, color, onClick }) => (
        <div onClick={onClick} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors cursor-pointer">
            <div className={`flex items-center gap-3 ${color}`}>
                {icon}
                <span className="font-bold text-gray-700 text-xs">{label}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
        </div>
    );

    const AdminView = () => {
        const [users, setUsers] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchUsers();
        }, []);

        const fetchUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setUsers(data || []);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="space-y-8">
                <header>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-100 p-3 rounded-2xl">
                            <Shield size={32} className="text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Administration</h1>
                            <p className="text-gray-500 font-medium">Gestion des utilisateurs et statistiques</p>
                        </div>
                    </div>
                </header>

                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider">Utilisateurs Total</h3>
                            <Users size={20} className="text-blue-500" />
                        </div>
                        <p className="text-4xl font-black text-gray-900">{users.length}</p>
                        <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Inscrits sur la plateforme
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-900">Utilisateurs Inscrits</h3>
                        <button onClick={fetchUsers} className="text-blue-600 hover:text-blue-700 font-bold text-sm">
                            Actualiser
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Chargement...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold text-xs">
                                    <tr>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Nom</th>
                                        <th className="p-4">Date d'inscription</th>
                                        <th className="p-4 text-right">ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 font-bold text-gray-900">{user.email || 'Email non disponible'}</td>
                                            <td className="p-4 text-gray-600 font-medium">{user.username || '-'}</td>
                                            <td className="p-4 text-gray-500">
                                                {new Date(user.updated_at || Date.now()).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="p-4 text-right text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}...</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-500">Aucun utilisateur trouvé</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const DevisDQE = () => {
        // --- DATA & STATE ---
        const [viewMode, setViewMode] = useState('list'); // 'list' | 'editor'
        const [companyInfo, setCompanyInfo] = useState(() => {
            const saved = localStorage.getItem('baticalkul_company_info');
            return saved ? JSON.parse(saved) : {
                name: "Votre Entreprise",
                address: "Adresse de l'entreprise",
                contact: "email@exemple.com | 01 23 45 67 89",
                siret: "SIRET 000 000 000 00000",
                tva: "TVA FR 00 000000000"
            };
        });

        // Save company info changes to localStorage
        useEffect(() => {
            localStorage.setItem('baticalkul_company_info', JSON.stringify(companyInfo));
        }, [companyInfo]);

        const [clientInfo, setClientInfo] = useState({
            name: "Client Exemple",
            address: "Projet Villa R+1",
            email: "client@email.com",
            tel: "06 12 34 56 78"
        });

        // Quote metadata
        const [quoteMetadata, setQuoteMetadata] = useState({
            numero: `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
            date: new Date().toISOString().split('T')[0],
            validite: 30, // jours
            tauxTVA: 20 // %
        });

        const [isEditingHeader, setIsEditingHeader] = useState(false);

        // State for Saved Quotes Management
        const [savedQuotes, setSavedQuotes] = useState([]);
        const [showSaveModal, setShowSaveModal] = useState(false);
        const [showLoadModal, setShowLoadModal] = useState(false);
        const [showTypeModal, setShowTypeModal] = useState(false);
        const [quoteName, setQuoteName] = useState('');
        const [quoteType, setQuoteType] = useState('dqe'); // 'estimatif' | 'quantitatif' | 'dqe'

        // Load saved quotes on mount
        // Load saved quotes on mount
        useEffect(() => {
            const saved = localStorage.getItem('baticalkul_devis_saves');
            if (saved) setSavedQuotes(JSON.parse(saved));
        }, []);

        // --- CALCUL DES QUANTITÉS (Automatique depuis project) ---
        // 1. Terrassement (Est. 30% volume fondation + marge)
        const volFondations = project.semelles.reduce((sum, s) => sum + (s.longueur * s.largeur * s.epaisseur * s.quantity), 0);
        const terrassementQty = parseFloat((volFondations * 1.5).toFixed(2)) || 50;

        // 2. Fondation (Béton semelles + poteaux enterrés)
        const volPoteaux = project.poteaux.reduce((sum, p) => sum + (p.sectionL * p.sectionH * 3 * (p.nb || 1)), 0); // Est. haut 3m
        const fondationQty = parseFloat(volFondations.toFixed(2));

        // 3. Maçonnerie (Surface murs)
        const surfMurs = project.murs.reduce((sum, m) => sum + (m.longueur * m.hauteur), 0);
        const maconnerieQty = parseFloat(surfMurs.toFixed(2));

        // 4. Dalles
        const surfDalles = project.dalles.reduce((sum, d) => sum + (d.longueur * d.largeur), 0);

        // 5. Toiture
        const surfToiture = project.toiture ? project.toiture.surfaceAuSol : 0;

        // 6. Finitions
        const surfCarrelage = project.carrelage.reduce((sum, c) => sum + (c.longueur * c.largeur), 0);
        const surfPeinture = parseFloat((surfMurs * 2.5 + surfDalles).toFixed(2)); // Est. 2 faces + plafond

        // --- PRIX UNITAIRES (Modifiables) ---
        const [items, setItems] = useState([
            { id: 1, section: 'Terrassement', label: 'Décapage & Fouilles', unit: 'm³', qty: terrassementQty, price: 15, locked: false },
            { id: 2, section: 'Fondation', label: 'Béton de fondation + Ferraillage', unit: 'm³', qty: fondationQty, price: 120, locked: true },
            { id: 3, section: 'Maçonnerie', label: 'Murs en blocs (fourniture & pose)', unit: 'm²', qty: maconnerieQty, price: 25, locked: true },
            { id: 4, section: 'Maçonnerie', label: 'Dalle en béton armé', unit: 'm²', qty: surfDalles, price: 35, locked: true },
            { id: 5, section: 'Toiture', label: 'Charpente + Couverture', unit: 'm²', qty: surfToiture, price: 45, locked: true },
            { id: 6, section: 'Électricité', label: 'Installation complète (Forfait)', unit: 'Ens', qty: 1, price: 2000, locked: false },
            { id: 7, section: 'Plomberie', label: 'Installation complète (Forfait)', unit: 'Ens', qty: 1, price: 1800, locked: false },
            { id: 8, section: 'Finitions', label: 'Carrelage Sol', unit: 'm²', qty: surfCarrelage, price: 20, locked: true },
            { id: 9, section: 'Finitions', label: 'Peinture (Murs & Plafonds)', unit: 'm²', qty: surfPeinture, price: 5, locked: true },
        ]);

        // Mise à jour des qty si le projet change (seulement si locked=true pour recalcul auto)
        useEffect(() => {
            setItems(prev => prev.map(item => {
                if (!item.locked) return item; // Ne pas toucher aux items manuels
                if (item.label.includes('Fondation')) return { ...item, qty: fondationQty };
                if (item.label.includes('Murs')) return { ...item, qty: maconnerieQty };
                if (item.label.includes('Dalle')) return { ...item, qty: surfDalles };
                if (item.label.includes('Charpente')) return { ...item, qty: surfToiture };
                if (item.label.includes('Carrelage')) return { ...item, qty: surfCarrelage };
                if (item.label.includes('Peinture')) return { ...item, qty: surfPeinture };
                return item;
            }));
        }, [fondationQty, maconnerieQty, surfDalles, surfToiture, surfCarrelage, surfPeinture]);

        const totalGeneral = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

        const handlePriceChange = (id, newPrice) => {
            setItems(items.map(i => i.id === id ? { ...i, price: parseFloat(newPrice) || 0 } : i));
        };

        const handleQtyChange = (id, newQty) => {
            setItems(items.map(i => i.id === id ? { ...i, qty: parseFloat(newQty) || 0, locked: false } : i));
        };

        // --- QUOTE MANAGEMENT FUNCTIONS ---
        const handleSaveQuote = () => {
            if (!quoteName.trim()) return;
            const newQuote = {
                id: Date.now(),
                name: quoteName,
                date: new Date().toLocaleDateString(),
                quoteType, // Save type
                clientInfo: { ...clientInfo },
                companyInfo: { ...companyInfo },
                items: JSON.parse(JSON.stringify(items)), // Deep copy
                total: totalGeneral
            };
            const updated = [newQuote, ...savedQuotes];
            setSavedQuotes(updated);
            localStorage.setItem('baticalkul_devis_saves', JSON.stringify(updated));
            setQuoteName('');
            setShowSaveModal(false);
            setViewMode('list');
        };

        const handleLoadQuote = (quote) => {
            if (confirm(`Charger le devis "${quote.name}" ? Cela remplacera le devis actuel.`)) {
                setClientInfo(quote.clientInfo);
                setCompanyInfo(quote.companyInfo || companyInfo);
                setItems(quote.items);
                setQuoteType(quote.quoteType || 'dqe');
                setShowLoadModal(false);
                setViewMode('editor');
            }
        };

        const handleDeleteQuote = (id, e) => {
            e.stopPropagation();
            if (confirm('Supprimer ce devis sauvegardé ?')) {
                const updated = savedQuotes.filter(q => q.id !== id);
                setSavedQuotes(updated);
                localStorage.setItem('baticalkul_devis_saves', JSON.stringify(updated));
            }
        };

        const handleCreateNew = () => {
            // Reset to defaults
            setClientInfo({ name: "Client Exemple", address: "Adresse du chantier", email: "client@email.com", tel: "06 12 34 56 78" });
            // Unlock all items to re-sync with project
            setItems(items.map(i => ({ ...i, locked: false })));
            setShowTypeModal(true);
        };

        const handleSelectType = (type) => {
            setQuoteType(type);
            setShowTypeModal(false);
            setViewMode('editor');
        };

        // --- DASHBOARD VIEW ---
        if (viewMode === 'list') {
            return (
                <div className="p-4 space-y-6 pb-32">
                    <header className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <FileText size={28} className="text-blue-600" />
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Mes Devis</h2>
                        </div>
                    </header>

                    {/* TYPE SELECTION MODAL */}
                    {showTypeModal && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
                                <h3 className="text-xl font-black text-gray-900 mb-6 text-center uppercase tracking-tight">Type de Devis</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleSelectType('estimatif')}
                                        className="w-full bg-white border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 text-blue-900 p-4 rounded-xl font-bold flex items-center justify-between group transition-all"
                                    >
                                        <div className="text-left">
                                            <span className="block text-sm uppercase tracking-wider text-blue-400 font-black mb-1">STANDARD</span>
                                            <span className="text-lg">Devis Estimatif</span>
                                        </div>
                                        <ChevronRight size={20} className="text-blue-300 group-hover:text-blue-600 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => handleSelectType('quantitatif')}
                                        className="w-full bg-white border-2 border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-900 p-4 rounded-xl font-bold flex items-center justify-between group transition-all"
                                    >
                                        <div className="text-left">
                                            <span className="block text-sm uppercase tracking-wider text-emerald-400 font-black mb-1">MÉTRÉ</span>
                                            <span className="text-lg">Devis Quantitatif</span>
                                        </div>
                                        <ChevronRight size={20} className="text-emerald-300 group-hover:text-emerald-600 transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => handleSelectType('dqe')}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl font-bold flex items-center justify-between group shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all"
                                    >
                                        <div className="text-left">
                                            <span className="block text-xs uppercase tracking-wider text-purple-200 font-black mb-1">COMPLET</span>
                                            <span className="text-lg">DQE (Quantitatif + Estimatif)</span>
                                        </div>
                                        <ChevronRight size={20} className="text-white/70 group-hover:text-white transition-colors" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowTypeModal(false)}
                                    className="w-full mt-6 text-gray-400 font-bold text-xs hover:text-gray-600 transition-colors"
                                >
                                    ANNULER
                                </button>
                            </div>
                        </div>
                    )}

                    {/* CREATE NEW CARD */}
                    <button
                        onClick={handleCreateNew}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Créer un nouveau devis</h3>
                            <p className="text-blue-100 text-xs mt-1">Basé sur les calculs actuels du projet</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                            <Plus size={24} />
                        </div>
                    </button>

                    {/* SAVED LIST */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Devis Enregistrés ({savedQuotes.length})</h3>
                        {savedQuotes.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm">Aucun devis sauvegardé.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {savedQuotes.map(quote => (
                                    <div key={quote.id} onClick={() => handleLoadQuote(quote)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{quote.name}</h4>
                                                <p className="text-xs text-gray-500 font-medium">{quote.date} • <span className="text-blue-600">{quote.clientInfo.name}</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-black text-gray-900 text-sm hidden sm:block">{quote.total.toLocaleString()} $</span>
                                            <button
                                                onClick={(e) => handleDeleteQuote(quote.id, e)}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 bg-gray-50 min-h-screen pb-32 font-sans relative">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6 no-print">
                    <button
                        onClick={() => setViewMode('list')}
                        className="text-gray-500 hover:text-blue-600 flex items-center gap-1 font-bold text-xs uppercase"
                    >
                        <ChevronLeft size={16} /> Retour
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSaveModal(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-green-700 transition"
                        >
                            <Save size={16} /> SAUVEGARDER
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition"
                        >
                            <Printer size={16} /> IMPRIMER
                        </button>
                    </div>
                </div>

                {/* SAVE MODAL */}
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in-95">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Sauvegarder le Devis</h3>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nom du devis (ex: Villa M. Dupont)"
                                className="w-full p-3 border border-gray-300 rounded-xl mb-4 text-sm font-medium focus:border-blue-500 outline-none"
                                value={quoteName}
                                onChange={e => setQuoteName(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-gray-500 font-bold text-xs hover:bg-gray-100 rounded-lg">ANNULER</button>
                                <button onClick={handleSaveQuote} disabled={!quoteName.trim()} className="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed">ENREGISTRER</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* DEVIS PAPER SHEET */}
                <div className="bg-white p-6 md:p-8 rounded-none md:rounded-xl shadow-lg border border-gray-200 text-gray-800 max-w-4xl mx-auto printable-sheet">

                    {/* Titre DEVIS + N° */}
                    <div className="text-center mb-6 border-b-4 border-blue-600 pb-4">
                        <h1 className="text-4xl font-black text-blue-900 uppercase tracking-wide">Devis</h1>
                        <p className="text-sm text-gray-500 mt-2 font-bold">N° {quoteMetadata.numero}</p>
                        <p className="text-xs text-gray-400">Date d'émission : {new Date(quoteMetadata.date).toLocaleDateString('fr-FR')}</p>
                        <p className="text-xs text-gray-400">Validité : {quoteMetadata.validite} jours</p>
                    </div>

                    {/* EN-TÊTE ENTREPRISE / CLIENT */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-8 border-b-2 border-gray-100 pb-6">
                        {/* Company Info */}
                        <div className="flex-1">
                            {isEditingHeader ? (
                                <div className="space-y-2">
                                    <input value={companyInfo.name} onChange={e => setCompanyInfo({ ...companyInfo, name: e.target.value })} className="w-full font-bold border rounded p-1 text-sm" placeholder="Nom entreprise" />
                                    <textarea value={companyInfo.address} onChange={e => setCompanyInfo({ ...companyInfo, address: e.target.value })} className="w-full text-sm border rounded p-1" placeholder="Adresse" />
                                    <input value={companyInfo.contact} onChange={e => setCompanyInfo({ ...companyInfo, contact: e.target.value })} className="w-full text-xs border rounded p-1" placeholder="Contact" />
                                    <input value={companyInfo.siret} onChange={e => setCompanyInfo({ ...companyInfo, siret: e.target.value })} className="w-full text-xs border rounded p-1" placeholder="SIRET" />
                                    <input value={companyInfo.tva} onChange={e => setCompanyInfo({ ...companyInfo, tva: e.target.value })} className="w-full text-xs border rounded p-1" placeholder="N° TVA" />
                                </div>
                            ) : (
                                <div>
                                    <h2 className="text-2xl font-black text-blue-900 uppercase mb-1">{companyInfo.name}</h2>
                                    <p className="text-sm text-gray-600 whitespace-pre-line">{companyInfo.address}</p>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">{companyInfo.contact}</p>
                                    <div className="mt-3 text-xs text-gray-400 space-y-0.5">
                                        <p>SIRET : {companyInfo.siret}</p>
                                        <p>TVA : {companyInfo.tva}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Client Info (Boxed) */}
                        <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                            <button
                                onClick={() => setIsEditingHeader(!isEditingHeader)}
                                className="absolute top-2 right-2 text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition no-print"
                            >
                                <Edit2 size={14} />
                            </button>
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Client</h3>
                            {isEditingHeader ? (
                                <div className="space-y-2">
                                    <input value={clientInfo.name} onChange={e => setClientInfo({ ...clientInfo, name: e.target.value })} className="w-full font-bold border rounded p-1 text-sm" placeholder="Nom client" />
                                    <input value={clientInfo.address} onChange={e => setClientInfo({ ...clientInfo, address: e.target.value })} className="w-full text-sm border rounded p-1" placeholder="Adresse chantier" />
                                    <input value={clientInfo.email} onChange={e => setClientInfo({ ...clientInfo, email: e.target.value })} className="w-full text-xs border rounded p-1" placeholder="Email" />
                                    <input value={clientInfo.tel} onChange={e => setClientInfo({ ...clientInfo, tel: e.target.value })} className="w-full text-xs border rounded p-1" placeholder="Téléphone" />
                                </div>
                            ) : (
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{clientInfo.name}</p>
                                    <p className="text-sm text-gray-600">{clientInfo.address}</p>
                                    <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                                        <p>{clientInfo.email}</p>
                                        <p>{clientInfo.tel}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TABLEAU DEVIS */}
                    <div className="overflow-x-auto">
                        <table className="w-full mb-8 text-sm">
                            <thead className="bg-blue-50 text-blue-900 border-b-2 border-blue-100">
                                <tr>
                                    <th className="py-3 px-2 text-left w-16">Réf</th>
                                    <th className="py-3 px-2 text-left">Désignation</th>
                                    <th className="py-3 px-2 text-center w-16">U</th>
                                    <th className="py-3 px-2 text-center w-20">Qté</th>
                                    {quoteType !== 'quantitatif' && (
                                        <>
                                            <th className="py-3 px-2 text-right w-24">P.U HT</th>
                                            <th className="py-3 px-2 text-right w-28">Total HT</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[...new Set(items.map(i => i.section))].map((section, sIndex) => {
                                    const sectionItems = items.filter(i => i.section === section);
                                    return (
                                        <React.Fragment key={section}>
                                            <tr className="bg-gray-50/50">
                                                <td colSpan={quoteType !== 'quantitatif' ? "6" : "4"} className="py-2 px-3 font-bold text-blue-800 text-xs uppercase tracking-wider border-t border-gray-100 mt-4">
                                                    Lot {sIndex + 1} : {section}
                                                </td>
                                            </tr>
                                            {sectionItems.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-2 px-3 text-gray-400 text-xs">{sIndex + 1}.{index + 1}</td>
                                                    <td className="py-2 px-2 font-medium text-gray-700">{item.label}</td>
                                                    <td className="py-2 px-2 text-center text-gray-500 text-xs">{item.unit}</td>
                                                    <td className="py-2 px-2 text-center">
                                                        <input
                                                            type="number"
                                                            value={item.qty}
                                                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                                            className="w-16 text-center bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 font-medium outline-none"
                                                        />
                                                    </td>
                                                    {quoteType !== 'quantitatif' && (
                                                        <>
                                                            <td className="py-2 px-2 text-right text-gray-600">
                                                                <input
                                                                    type="number"
                                                                    value={item.price}
                                                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                                                    className="w-20 text-right bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none"
                                                                />
                                                            </td>
                                                            <td className="py-2 px-2 text-right font-bold text-gray-800">
                                                                {(item.qty * item.price).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTAL FINANCIAL SUMMARY */}
                    {quoteType !== 'quantitatif' && (
                        <div className="flex flex-col items-end mb-8 space-y-2">
                            <div className="w-full md:w-80 space-y-2">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Total HT</span>
                                    <span className="font-bold">{items.reduce((sum, i) => sum + (i.qty * i.price), 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>TVA ({quoteMetadata.tauxTVA}%)</span>
                                    <span className="font-bold">{(items.reduce((sum, i) => sum + (i.qty * i.price), 0) * (quoteMetadata.tauxTVA / 100)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                                </div>
                                <div className="border-t border-gray-200 my-2"></div>
                                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex justify-between items-center">
                                    <span className="text-blue-100 font-bold uppercase tracking-wider text-sm">Total TTC</span>
                                    <span className="text-2xl font-black">
                                        {(items.reduce((sum, i) => sum + (i.qty * i.price), 0) * (1 + quoteMetadata.tauxTVA / 100)).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FOOTER CONDITIONS */}
                    <div className="grid md:grid-cols-2 gap-8 text-xs text-gray-500 border-t pt-6">
                        <div>
                            <h4 className="font-bold text-gray-700 uppercase mb-2">Délais d'exécution</h4>
                            <textarea className="w-full bg-gray-50 p-2 rounded border border-gray-100 h-20 resize-none outline-none focus:border-blue-300" defaultValue="Le présent devis est valable pour une durée de 3 mois. Début des travaux 2 semaines après signature." />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-700 uppercase mb-2">Conditions de paiement</h4>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>30% à la commande</li>
                                <li>30% au démarrage du chantier</li>
                                <li>30% à la mise hors d'eau</li>
                                <li>10% à la réception</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t-2 border-dotted border-gray-200 flex justify-between text-xs font-bold text-gray-400 uppercase">
                        <div>Signature Prestataire</div>
                        <div>Signature Client ("Bon pour accord")</div>
                    </div>
                </div>
            </div>
        );
    };

    const PlanningView = () => {
        // --- STATE ---
        const [viewMode, setViewMode] = useState('list'); // 'list' | 'editor'
        const [savedPlanifications, setSavedPlanifications] = useState(() => {
            const saved = localStorage.getItem('baticalkul_planifications');
            return saved ? JSON.parse(saved) : [{
                id: 1,
                name: 'Exemple: Villa',
                description: 'Construction villa R+1',
                date: new Date().toISOString().split('T')[0],
                phases: [
                    { id: 1, name: 'Fondations', duree: 5, color: 'bg-blue-500' },
                    { id: 2, name: 'Élévation', duree: 10, color: 'bg-orange-500' }
                ]
            }];
        });

        // Current Editing State
        const [activePlanId, setActivePlanId] = useState(null);
        const [currentPlanName, setCurrentPlanName] = useState('');
        const [currentPlanDesc, setCurrentPlanDesc] = useState('');
        const [currentPlanDate, setCurrentPlanDate] = useState('');
        const [currentPhases, setCurrentPhases] = useState([]);

        // New Phase State
        const [newPhaseName, setNewPhaseName] = useState('');
        const [newPhaseDuree, setNewPhaseDuree] = useState(5);
        const [newPhaseColor, setNewPhaseColor] = useState('bg-blue-500');

        // Color Options
        const colorOptions = [
            { bg: 'bg-blue-500', name: 'Bleu' },
            { bg: 'bg-orange-500', name: 'Orange' },
            { bg: 'bg-green-500', name: 'Vert' },
            { bg: 'bg-purple-500', name: 'Violet' },
            { bg: 'bg-pink-500', name: 'Rose' },
            { bg: 'bg-cyan-500', name: 'Cyan' },
            { bg: 'bg-red-500', name: 'Rouge' },
            { bg: 'bg-yellow-500', name: 'Jaune' },
        ];

        // --- HANDLERS ---

        const handleSavePlan = () => {
            if (!currentPlanName.trim()) return;

            const updatedPlan = {
                id: activePlanId || Date.now(),
                name: currentPlanName,
                description: currentPlanDesc,
                date: currentPlanDate,
                phases: currentPhases
            };

            let updatedList;
            if (activePlanId) {
                updatedList = savedPlanifications.map(p => p.id === activePlanId ? updatedPlan : p);
            } else {
                updatedList = [updatedPlan, ...savedPlanifications];
            }

            setSavedPlanifications(updatedList);
            localStorage.setItem('baticalkul_planifications', JSON.stringify(updatedList));

            // Return to list
            setViewMode('list');
            setActivePlanId(null);
        };

        const handleLoadPlan = (plan) => {
            setActivePlanId(plan.id);
            setCurrentPlanName(plan.name);
            setCurrentPlanDesc(plan.description);
            setCurrentPlanDate(plan.date);
            setCurrentPhases(plan.phases || []);
            setViewMode('editor');
        };

        const handleCreateNew = () => {
            setActivePlanId(null);
            setCurrentPlanName('');
            setCurrentPlanDesc('');
            setCurrentPlanDate(new Date().toISOString().split('T')[0]);
            setCurrentPhases([]);
            setViewMode('editor');
        };

        const handleDeletePlan = (id, e) => {
            e.stopPropagation();
            if (confirm('Supprimer cette planification ?')) {
                const updatedList = savedPlanifications.filter(p => p.id !== id);
                setSavedPlanifications(updatedList);
                localStorage.setItem('baticalkul_planifications', JSON.stringify(updatedList));
            }
        };

        const handleAddPhase = () => {
            if (!newPhaseName.trim()) return;
            setCurrentPhases([...currentPhases, {
                id: Date.now(),
                name: newPhaseName,
                duree: parseInt(newPhaseDuree) || 1,
                color: newPhaseColor
            }]);
            setNewPhaseName('');
            setNewPhaseDuree(5);
        };

        const handleDeletePhase = (phaseId) => {
            setCurrentPhases(currentPhases.filter(p => p.id !== phaseId));
        };

        // --- VIEWS ---

        // 1. DASHBOARD VIEW
        if (viewMode === 'list') {
            return (
                <div className="p-4 space-y-6 pb-32">
                    <header className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={28} className="text-indigo-600" />
                            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Mes Plannings</h2>
                        </div>
                    </header>

                    {/* CREATE NEW CARD */}
                    <button
                        onClick={handleCreateNew}
                        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Créer un nouveau planning</h3>
                            <p className="text-indigo-100 text-xs mt-1">Organisez vos travaux et phases</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-full group-hover:bg-white/30 transition-colors">
                            <Plus size={24} />
                        </div>
                    </button>

                    {/* SAVED LIST */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Plannings Enregistrés ({savedPlanifications.length})</h3>
                        {savedPlanifications.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-gray-400 text-sm">Aucun planning sauvegardé.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {savedPlanifications.map(plan => {
                                    const totalDays = (plan.phases || []).reduce((sum, p) => sum + p.duree, 0);
                                    return (
                                        <div key={plan.id} onClick={() => handleLoadPlan(plan)} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{plan.name}</h4>
                                                    <p className="text-xs text-gray-500 font-medium">{plan.date} • <span className="text-indigo-600">{totalDays} jours</span></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={(e) => handleDeletePlan(plan.id, e)}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // 2. EDITOR VIEW
        const totalDuration = currentPhases.reduce((acc, p) => acc + p.duree, 0);

        return (
            <div className="p-4 bg-gray-50 min-h-screen pb-32 font-sans">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6 no-print">
                    <button
                        onClick={() => setViewMode('list')}
                        className="text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-bold text-xs uppercase"
                    >
                        <ChevronLeft size={16} /> Retour
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSavePlan}
                            disabled={!currentPlanName.trim()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <Save size={16} /> SAUVEGARDER
                        </button>
                    </div>
                </div>

                {/* MAIN EDITOR CONTENT */}
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* 1. PROJECT INFO CARD */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-100">
                            <Info size={18} className="text-indigo-600" />
                            <h3 className="font-bold text-gray-800 text-sm uppercase">Informations du Chantier</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Nom du planning</label>
                                <input
                                    value={currentPlanName}
                                    onChange={e => setCurrentPlanName(e.target.value)}
                                    placeholder="Ex: Construction Villa Mme. Dupont"
                                    className="w-full text-lg font-bold border-b-2 border-gray-200 focus:border-indigo-600 outline-none py-1 transition-colors bg-transparent placeholder-gray-300"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Date de début</label>
                                    <input
                                        type="date"
                                        value={currentPlanDate}
                                        onChange={e => setCurrentPlanDate(e.target.value)}
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Description</label>
                                    <input
                                        value={currentPlanDesc}
                                        onChange={e => setCurrentPlanDesc(e.target.value)}
                                        placeholder="Description optionnelle..."
                                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. VISUAL TIMELINE (GANTT) */}
                    {currentPhases.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                                    <Sliders size={18} className="text-indigo-600" /> Chronologie
                                </h3>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                    Total: {totalDuration} Jours
                                </span>
                            </div>

                            {/* Gantt Bars */}
                            <div className="flex h-12 rounded-full overflow-hidden bg-gray-100 w-full mb-6 relative">
                                {currentPhases.map((phase, idx) => {
                                    const widthPercent = (phase.duree / totalDuration) * 100;
                                    return (
                                        <div
                                            key={phase.id}
                                            style={{ width: `${widthPercent}%` }}
                                            className={`${phase.color} h-full border-r border-white/20 relative group transition-all hover:brightness-110`}
                                            title={`${phase.name}: ${phase.duree}j`}
                                        >
                                            {widthPercent > 10 && (
                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 truncate px-1">
                                                    {phase.name}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Phase List Cards */}
                            <div className="space-y-2">
                                {currentPhases.map((phase, index) => (
                                    <div key={phase.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 group hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${phase.color}`}></div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-xs text-gray-700">{index + 1}. {phase.name}</span>
                                                <span className="text-[10px] text-gray-400">{phase.duree} jours</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeletePhase(phase.id)} className="text-gray-300 hover:text-red-500">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. ADD PHASE FORM */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                        <h3 className="font-bold text-gray-800 text-sm uppercase mb-4 flex items-center gap-2">
                            <Plus size={18} className="text-indigo-600" /> Ajouter une Phase
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                            <div className="md:col-span-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Nom de la phase</label>
                                <input
                                    value={newPhaseName}
                                    onChange={e => setNewPhaseName(e.target.value)}
                                    placeholder="Ex: Fondations, Murs..."
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Durée (Jours)</label>
                                <input
                                    type="number"
                                    value={newPhaseDuree}
                                    onChange={e => setNewPhaseDuree(e.target.value)}
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddPhase()}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Couleur</label>
                                <div className="flex gap-1">
                                    {colorOptions.slice(0, 4).map(c => (
                                        <button
                                            key={c.bg}
                                            onClick={() => setNewPhaseColor(c.bg)}
                                            className={`w-6 h-6 rounded-full ${c.bg} ${newPhaseColor === c.bg ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleAddPhase}
                            disabled={!newPhaseName.trim()}
                            className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            AJOUTER LA PHASE
                        </button>
                    </div>

                </div>
            </div>
        );






        const AddEscalier = ({ onAdd }) => {
            const [temp, setTemp] = useState({ volume: 1, dosage: 350 });
            return (
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase">
                        <TrendingUp size={16} className="text-gray-600" /> Escalier (Volume)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Volume (m³)</label>
                            <input type="number" placeholder="m³" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.volume} onChange={e => setTemp({ ...temp, volume: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Dosage Ciment</label>
                            <input type="number" placeholder="kg/m³" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.dosage} onChange={e => setTemp({ ...temp, dosage: parseInt(e.target.value) || 350 })} />
                        </div>
                    </div>
                    <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-gray-800 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> AJOUTER ESCALIER</button>
                </div>
            );
        };

        const AddDivers = ({ onAdd }) => {
            const [temp, setTemp] = useState({ quantity: 1, longueur: 1, largeur: 1, epaisseur: 0.1, dosage: 350, isReinforced: false, steelRatio: 80 });
            return (
                <div className="bg-white p-4 rounded-xl shadow-sm border mb-4">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm uppercase">
                        <Layers size={16} className="text-pink-600" /> Divers / Autre Béton
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div>
                            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Quantité</label>
                            <input type="number" placeholder="1" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.quantity} onChange={e => setTemp({ ...temp, quantity: parseInt(e.target.value) || 1 })} />
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Dosage (kg/m³)</label>
                            <input type="number" placeholder="350" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.dosage} onChange={e => setTemp({ ...temp, dosage: parseInt(e.target.value) || 350 })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">L (m)</label>
                            <input type="number" placeholder="L" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.longueur} onChange={e => setTemp({ ...temp, longueur: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">l (m)</label>
                            <input type="number" placeholder="l" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.largeur} onChange={e => setTemp({ ...temp, largeur: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-400 font-bold uppercase block mb-1">Ep (m)</label>
                            <input type="number" placeholder="Ep" className="w-full p-2 bg-gray-50 border rounded text-xs" value={temp.epaisseur} onChange={e => setTemp({ ...temp, epaisseur: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>

                    <div className="bg-gray-50 p-2 rounded mb-3">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" checked={temp.isReinforced} onChange={e => setTemp(prev => ({ ...prev, isReinforced: e.target.checked }))} />
                            <span className="text-[10px] uppercase font-bold text-gray-600">Armé ?</span>
                        </div>
                        {temp.isReinforced && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                <label className="text-[8px] text-gray-400 font-bold uppercase block">Ratio Acier (kg/m³)</label>
                                <input type="number" placeholder="80" className="w-full p-2 bg-white border rounded text-xs" value={temp.steelRatio} onChange={e => setTemp({ ...temp, steelRatio: parseFloat(e.target.value) || 0 })} />
                            </div>
                        )}
                    </div>

                    <button onClick={() => onAdd && onAdd(temp)} className="w-full bg-pink-600 text-white py-2 rounded-lg font-bold text-xs flex justify-center items-center gap-2 active:scale-95 transition-transform"><Plus size={14} /> AJOUTER ÉLÉMENT</button>
                </div>
            );
        };

        // --- PlanningView Main Render ---
        return (
            <div className="p-4 space-y-4 pb-32">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-4">Planning Chantier</h2>
                    {viewMode === 'list' ? (
                        <div className="space-y-4">
                            <button onClick={() => { setActivePlanId(null); setViewMode('editor'); }} className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-between group active:scale-95 transition-all">
                                <span className="font-bold">Créer un nouveau planning</span>
                                <Plus className="bg-white/20 p-1 rounded-full w-8 h-8" />
                            </button>

                            {savedPlanifications.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">Aucun planning</div>
                            ) : (
                                <div className="space-y-2">
                                    {savedPlanifications.map(p => (
                                        <div key={p.id} onClick={() => handleLoadPlan(p)} className="bg-white p-4 rounded-xl border flex justify-between items-center cursor-pointer hover:shadow-md transition-all">
                                            <div>
                                                <h3 className="font-bold text-gray-800">{p.name}</h3>
                                                <p className="text-xs text-gray-500">{p.phases?.length || 0} phases</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeletePlan(p.id); }} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <button onClick={() => setViewMode('list')} className="text-gray-500"><ChevronLeft /></button>
                                <span className="font-bold uppercase">Éditeur</span>
                                <button onClick={handleSavePlan} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"><Save size={14} /> SAUVEGARDER</button>
                            </div>

                            <input type="text" placeholder="Nom du planning" className="w-full p-2 border rounded font-bold" value={currentPlanName} onChange={e => setCurrentPlanName(e.target.value)} />

                            <div className="space-y-3">
                                <div className="bg-gray-50 p-3 rounded-lg border">
                                    <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">Ajouter une phase</h4>
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <input type="text" placeholder="Nom phase" className="p-2 border rounded text-xs" value={newPhaseName} onChange={e => setNewPhaseName(e.target.value)} />
                                        <input type="number" placeholder="Durée (jours)" className="p-2 border rounded text-xs" value={newPhaseDuree} onChange={e => setNewPhaseDuree(parseInt(e.target.value) || 1)} />
                                    </div>
                                    <div className="flex gap-1 mb-2 overflow-x-auto pb-1">
                                        {colorOptions.map(c => (
                                            <button key={c.name} onClick={() => setNewPhaseColor(c.bg)} className={`w-6 h-6 rounded-full ${c.bg} ${newPhaseColor === c.bg ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`} />
                                        ))}
                                    </div>
                                    <button onClick={handleAddPhase} className="w-full bg-green-600 text-white py-2 rounded font-bold text-xs">AJOUTER PHASE</button>
                                </div>

                                <div className="space-y-2">
                                    {currentPhases.map(phase => (
                                        <div key={phase.id} className="bg-white p-3 rounded border flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-10 rounded-full ${phase.color}`} />
                                                <div>
                                                    <p className="font-bold text-sm">{phase.name}</p>
                                                    <p className="text-xs text-gray-500">{phase.duree} jours</p>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeletePhase(phase.id)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };



    const Dashboard = () => (
        <div className="p-4 space-y-6 pt-20">


            <div className="grid grid-cols-2 gap-3">
                <StatCard title="Ciment" value={totals.ciment} unit="Sacs 50kg" color="bg-blue-600" />
                <StatCard title="Briques" value={totals.briques} unit="Unités" color="bg-red-600" />
                <StatCard title="Sable" value={totals.sable} unit="m³" extra={` (~${(totals.sable * 1.6).toFixed(1)}T)`} color="bg-amber-500" />
                <StatCard title="Gravier" value={totals.gravier} unit="m³" extra={` (~${(totals.gravier * 1.5).toFixed(1)}T)`} color="bg-zinc-500" />
                <StatCard title="Acier total" value={totals.acier} unit="kg" extra={` (~${(totals.acier / 1000).toFixed(2)}T)`} color="bg-slate-800" />
                <StatCard title="Coffrage Bois" value={totals.coffrage} unit="m²" color="bg-amber-700" />
                <StatCard title="Tôles" value={totals.toles} unit="Feuilles" color="bg-cyan-600" />
                <StatCard title="Chevrons" value={totals.chevrons} unit="Unités" color="bg-lime-600" />
                <StatCard title="Carrelage" value={totals.nbCarreaux} unit="Carreaux" extra={` (${totals.surfaceCarrelage} m²)`} color="bg-emerald-600" />
            </div>

            <div className="bg-white border p-3 rounded-xl flex items-start gap-3 shadow-sm">
                <Settings2 className="text-gray-400 shrink-0" size={18} />
                <div>
                    <p className="text-[10px] font-bold text-gray-800 mb-0.5 tracking-wide uppercase underline">Aide Mémoire</p>
                    <p className="text-[10px] text-gray-500 leading-tight italic">Calcul des tôles : Largeur utile 0.85m, Longueur 2m. Pente prise en compte.</p>
                </div>
            </div>
        </div>
    );

    const CalcView = () => {
        const [activeCategory, setActiveCategory] = useState('fondation');

        const categories = [
            { id: 'fondation', label: 'Fondations', icon: '🏗️' },
            { id: 'structure', label: 'Structure', icon: '🏛️' },
            { id: 'murs', label: 'Murs', icon: '🧱' },
            { id: 'toiture', label: 'Toiture', icon: '🏠' },
            { id: 'finitions', label: 'Finitions', icon: '🎨' }
        ];

        return (
            <div className="p-4 pb-28 space-y-4">
                <h2 className="text-lg font-black text-gray-800 uppercase tracking-tight border-b-2 border-blue-600 w-fit pr-4 mb-4">Calculateur Rapide</h2>

                <ResultsSummary totals={quickTotals} />

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Forms Container */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm min-h-[400px]">

                    {/* FONDATIONS */}
                    {activeCategory === 'fondation' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b">
                                <span className="text-2xl">🏗️</span>
                                <div>
                                    <h3 className="font-black text-gray-800 uppercase text-sm">Fondations</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">Semelles isolées</p>
                                </div>
                            </div>
                            <AddSemelle onAdd={(item) => setQuickProject({ ...quickProject, semelles: [...quickProject.semelles, item] })} />
                        </div>
                    )}

                    {/* STRUCTURE */}
                    {activeCategory === 'structure' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b">
                                <span className="text-2xl">🏛️</span>
                                <div>
                                    <h3 className="font-black text-gray-800 uppercase text-sm">Structure Béton</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">Poteaux, Poutres, Dalles, Escaliers</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <AddPoteau onAdd={(item) => setQuickProject({ ...quickProject, poteaux: [...quickProject.poteaux, item] })} />
                                <div className="border-t border-gray-200"></div>
                                <AddPoutre onAdd={(item) => setQuickProject({ ...quickProject, poutres: [...quickProject.poutres, item] })} />
                                <div className="border-t border-gray-200"></div>
                                <AddDalle onAdd={(item) => setQuickProject({ ...quickProject, dalles: [...quickProject.dalles, item] })} />
                                <div className="border-t border-gray-200"></div>
                                <AddEscalier onAdd={(item) => setQuickProject({ ...quickProject, escaliers: [...quickProject.escaliers, item] })} />
                            </div>
                        </div>
                    )}

                    {/* MURS */}
                    {activeCategory === 'murs' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b">
                                <span className="text-2xl">🧱</span>
                                <div>
                                    <h3 className="font-black text-gray-800 uppercase text-sm">Murs</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">Élévation briques/parpaings</p>
                                </div>
                            </div>
                            <AddMur
                                onAdd={(item) => setQuickProject({ ...quickProject, murs: [...quickProject.murs, item] })}
                                brickWaste={quickProject.brickWaste}
                                onUpdateWaste={(waste) => setQuickProject({ ...quickProject, brickWaste: parseFloat(waste) })}
                            />
                        </div>
                    )}

                    {/* TOITURE */}
                    {activeCategory === 'toiture' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b">
                                <span className="text-2xl">🏠</span>
                                <div>
                                    <h3 className="font-black text-gray-800 uppercase text-sm">Toiture</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">Charpente & Couverture</p>
                                </div>
                            </div>
                            <AddToiture onAdd={(item) => setQuickProject({ ...quickProject, toiture: item })} />
                            {quickProject.toiture && (
                                <p className="text-[10px] text-cyan-600 mt-2 font-bold italic text-center">✓ Toiture configurée : {quickProject.toiture.surfaceAuSol}m² à {quickProject.toiture.penteDeg}°</p>
                            )}
                        </div>
                    )}

                    {/* FINITIONS */}
                    {activeCategory === 'finitions' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b">
                                <span className="text-2xl">🎨</span>
                                <div>
                                    <h3 className="font-black text-gray-800 uppercase text-sm">Finitions & Divers</h3>
                                    <p className="text-[10px] text-gray-500 font-medium">Carrelage & autres matériaux</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <AddCarrelage onAdd={(item) => setQuickProject({ ...quickProject, carrelage: [...quickProject.carrelage, item] })} />
                                <div className="border-t border-gray-200"></div>
                                <AddDivers onAdd={(item) => setQuickProject({ ...quickProject, divers: [...quickProject.divers, item] })} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2 mt-6">
                    <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">Récapitulatif (Quick Calc)</h3>
                    {quickProject.semelles.map((s, i) => (
                        <ListItem key={`s-${i}`} title="Semelle Isolée" details={`${s.longueur}x${s.largeur}m | Φ${s.diametre}`} color="border-blue-500" onRemove={() => {
                            const news = [...quickProject.semelles]; news.splice(i, 1); setQuickProject({ ...quickProject, semelles: news });
                        }} />
                    ))}
                    {quickProject.poteaux.map((p, i) => {
                        const q = p.quantity || 1;
                        const perimetre = (p.sectionL + p.sectionl) * 2;
                        const surface = perimetre * p.hauteur * q;
                        const board = BOARD_TYPES.find(b => b.id === p.boardId) || BOARD_TYPES[2];
                        const nbPlanches = Math.ceil((surface * 1.1) / (board.l * board.w));
                        return (
                            <ListItem key={`pot-${i}`} title="Poteau" details={`${q > 1 ? q + 'x ' : ''}H:${p.hauteur}m (${p.sectionL}x${p.sectionl}) | ${nbPlanches} Planches | ${p.nbBarres} Barres Φ${p.diametre}`} color="border-gray-500" onRemove={() => {
                                const newp = [...quickProject.poteaux]; newp.splice(i, 1); setQuickProject({ ...quickProject, poteaux: newp });
                            }} />
                        );
                    })}
                    {quickProject.poutres.map((p, i) => {
                        const surfacePoutre = (p.sectionL + (2 * p.sectionH)) * p.longueur;
                        const board = (typeof BOARD_TYPES !== 'undefined' ? BOARD_TYPES.find(b => b.id === p.boardId) : null) || { l: 4, w: 0.2 };
                        const nbPlanches = Math.ceil((surfacePoutre * 1.1) / (board.l * board.w));

                        return (
                            <ListItem key={`p-${i}`} title="Poutre" details={`L: ${p.longueur}m | ${nbPlanches} Planches (${board.l}m x ${board.w * 100}cm)`} color="border-orange-500" onRemove={() => {
                                const newp = [...quickProject.poutres]; newp.splice(i, 1); setQuickProject({ ...quickProject, poutres: newp });
                            }} />
                        );
                    })}
                    {quickProject.murs.map((m, i) => {
                        const bLabel = BRICK_TYPES.find(b => b.id === m.briqueId)?.label || 'Brique';
                        return (
                            <ListItem key={`m-${i}`} title={`Mur ${bLabel}`} details={`${m.longueur}x${m.hauteur}m`} color="border-red-500" onRemove={() => {
                                const newm = [...quickProject.murs]; newm.splice(i, 1); setQuickProject({ ...quickProject, murs: newm });
                            }} />
                        );
                    })}
                    {quickProject.dalles.map((d, i) => {
                        const surface = d.longueur * d.largeur;
                        const board = (BOARD_TYPES && BOARD_TYPES.find(b => b.id === (d.boardId || 'p4_20'))) || (BOARD_TYPES ? BOARD_TYPES[2] : { l: 4, w: 0.2 });
                        const nbPlanches = Math.ceil(surface / (board.l * board.w));
                        const espac = d.espacementEtaiement || 0.60;
                        const chev = (Math.ceil(d.longueur / espac) + 1) * (Math.ceil(d.largeur / espac) + 1);

                        return (
                            <ListItem key={`d-${i}`} title="Dalle Béton" details={`${d.longueur}x${d.largeur}x${d.epaisseur}m | ${surface.toFixed(2)}m² | ${nbPlanches} Planches | ${chev} Chevrons`} color="border-purple-500" onRemove={() => {
                                const newd = [...quickProject.dalles]; newd.splice(i, 1); setQuickProject({ ...quickProject, dalles: newd });
                            }} />
                        );
                    })}
                    {quickProject.escaliers.map((e, i) => {
                        return (
                            <ListItem key={`esc-${i}`} title="Escalier Béton" details={`H:${e.hauteur}m | ${e.nbMarches} marches | ${e.volume}m³`} color="border-orange-500" onRemove={() => {
                                const newEsc = [...quickProject.escaliers]; newEsc.splice(i, 1); setQuickProject({ ...quickProject, escaliers: newEsc });
                            }} />
                        );
                    })}
                    {quickProject.divers.map((d, i) => {
                        const q = d.quantity || 1;
                        const details = `${q > 1 ? q + 'x ' : ''}${d.longueur}x${d.largeur}x${d.epaisseur}m | ${d.dosage}kg/m³${d.isReinforced ? ' | ARMÉ' : ''}`;

                        return (
                            <ListItem key={`div-${i}`} title={d.label || "Divers Béton"} details={details} color="border-pink-500" onRemove={() => {
                                const newd = [...quickProject.divers]; newd.splice(i, 1); setQuickProject({ ...quickProject, divers: newd });
                            }} />
                        );
                    })}
                    {quickProject.carrelage.map((c, i) => {
                        const surface = c.longueur * c.largeur;
                        const tile = TILE_TYPES.find(t => t.id === c.tileId) || TILE_TYPES[4];
                        const nb = Math.ceil((surface * 1.05) / (tile.l * tile.w));
                        return (
                            <ListItem key={`c-${i}`} title="Carrelage Pièce" details={`${c.longueur}x${c.largeur}m (${surface}m²) | ${nb} Carreaux (${tile.label})`} color="border-emerald-500" onRemove={() => {
                                const newc = [...quickProject.carrelage]; newc.splice(i, 1); setQuickProject({ ...quickProject, carrelage: newc });
                            }} />
                        );
                    })}
                </div>
            </div >
        );
    };



    // Main component render  
    return (
        <div className="w-full min-h-screen bg-slate-50 font-sans pb-28 relative pt-14">
            <TopNavbar
                onConnect={() => setShowAuthModal(true)}
                currentUser={currentUser}
                onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
            />

            {/* Profile Dropdown Menu */}
            {showProfileMenu && currentUser && (
                <div className="fixed top-16 right-4 bg-white rounded-xl shadow-2xl border border-gray-100 w-64 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200 z-[9999]">
                    <div className="p-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                        <p className="text-xs font-bold opacity-80 uppercase">Connecté en tant que</p>
                        <p className="text-lg font-black">{currentUser.name}</p>
                    </div>
                    <div className="p-2">
                        <button
                            onClick={() => {
                                setShowProfileMenu(false);
                                setActiveTab('dashboard');
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                            <Layout size={18} className="text-gray-600" />
                            <span className="text-sm font-bold text-gray-700">Tableau de bord</span>
                        </button>
                        <button
                            onClick={() => {
                                setShowProfileMenu(false);
                                setPlusViewMode('settings');
                                setActiveTab('plus');
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                            <Settings2 size={18} className="text-gray-600" />
                            <span className="text-sm font-bold text-gray-700">Paramètres</span>
                        </button>
                        <button
                            onClick={() => {
                                setShowProfileMenu(false);
                                setActiveTab('admin');
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors text-left"
                        >
                            <Shield size={18} className="text-purple-600" />
                            <span className="text-sm font-bold text-gray-700">Tableau de Bord Admin</span>
                        </button>
                        <button
                            onClick={() => {
                                setShowProfileMenu(false);
                                setPlusViewMode('profile');
                                setActiveTab('plus');
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                            <User size={18} className="text-gray-600" />
                            <span className="text-sm font-bold text-gray-700">Mon Profil</span>
                        </button>
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                setCurrentUser(null);
                                setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-left"
                        >
                            <X size={18} className="text-red-600" />
                            <span className="text-sm font-bold text-red-600">Se déconnecter</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'calc' && <div className="pt-2"><CalcView /></div>}
            {activeTab === 'projects' && <div className="pt-2"><ProjectsView /></div>}
            {activeTab === 'devis' && <div className="pt-2"><DevisDQE /></div>}
            {activeTab === 'planning' && <div className="pt-2"><PlanningView /></div>}
            {activeTab === 'admin' && <div className="pt-2"><AdminView /></div>}
            {activeTab === 'forum' && <div className="pt-2"><ForumView /></div>}
            {activeTab === 'plus' && <div className="pt-2"><PlusView /></div>}

            {/* Floating Forum Button */}
            <button
                onClick={() => setActiveTab('forum')}
                className={`fixed bottom-28 right-6 ${activeTab === 'forum'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 scale-110'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-105'
                    } text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl transition-all duration-300 z-50 active:scale-95`}
            >
                <MessageSquare size={24} />
            </button>

            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[800px] bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl flex justify-around items-center px-2 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-x-auto">
                <NavItem active={activeTab === 'dashboard'} icon={<Layout size={18} />} label="Synthèse" onClick={() => setActiveTab('dashboard')} />
                <NavItem active={activeTab === 'calc'} icon={<Calculator size={18} />} label="Calculs" onClick={() => setActiveTab('calc')} />
                <NavItem active={activeTab === 'projects'} icon={<FolderOpen size={18} />} label="Projets" onClick={() => setActiveTab('projects')} />
                <NavItem active={activeTab === 'devis'} icon={<FileText size={18} />} label="Devis" onClick={() => setActiveTab('devis')} />
                <NavItem active={activeTab === 'planning'} icon={<Calendar size={18} />} label="Planning" onClick={() => setActiveTab('planning')} />
                <NavItem active={activeTab === 'plus'} icon={<Settings2 size={18} />} label="Plus" onClick={() => setActiveTab('plus')} />
            </nav>

            {showAuthModal && <AuthModal />}
        </div>
    );
};



export default App;
