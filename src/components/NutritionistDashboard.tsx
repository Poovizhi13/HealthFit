import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { healthRecordService } from "../services/api.js";
import "./NutritionistDashboard.css";

type Note = {
  id: string;
  content: string;
  timestamp: string;
  createdBy: string;
};

type HealthRecord = {
  id: string;
  fullName: string;
  age: string;
  gender: string;
  mobileNumber: string;
  height: string;
  weight: string;
  allergies?: string;
  surgeries?: string;
  medicalTreatment?: string;
  bloodType: string;
  alcoholOrSmoke: string;
  dietarySupplements?: string;
  purpose: string;
  healthCheckupDate: string;
  nutritionistNotes?: string;
  notesHistory: Note[];
  reportName?: string;
  submittedDate?: string;
};

type SortKey = keyof HealthRecord;

const NutritionistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [notesEditing, setNotesEditing] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState<{id: string, status: "saving" | "saved" | "error" | null}>({id: "", status: null});
  const [selectedPatient, setSelectedPatient] = useState<HealthRecord | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchRecords = async () => {
      try {
        if (import.meta.env.VITE_USE_API === "true") {
          const response = await healthRecordService.getAllRecords();
          setRecords(response);
        } else {
          const savedData = localStorage.getItem("healthRecords");
          if (savedData) {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed)) {
              setRecords(parsed);
            } else {
              setRecords([parsed]); // fallback in case single object was saved
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch health records", err);
        setError("Failed to load records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [navigate]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const sortedRecords = React.useMemo(() => {
    let sorted = [...records];
    if (sortConfig) {
      sorted.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        return sortConfig.direction === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return sorted;
  }, [records, sortConfig]);

  const filteredRecords = sortedRecords.filter(
    (record) =>
      record.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.mobileNumber.includes(searchTerm)
  );

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const startEditingNotes = (record: HealthRecord) => {
    setNotesEditing(record.id);
    setNotesDraft(record.nutritionistNotes || "");
  };

  const cancelEditingNotes = () => {
    setNotesEditing(null);
    setNotesDraft("");
  };

  const NotesPanel: React.FC<{ record: HealthRecord; onSave: (note: string) => void; onClose: () => void }> = ({
    record,
    onSave,
    onClose,
  }) => {
    const [newNote, setNewNote] = useState("");

    const handleSave = () => {
      if (newNote.trim()) {
        onSave(newNote);
        setNewNote("");
      }
    };

    return (
      <div className="notes-panel">
        <div className="notes-header">
          <h3>Notes for {record.fullName}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="notes-history">
          {record.notesHistory?.map((note) => (
            <div key={note.id} className="note-entry">
              <div className="note-metadata">
                <span className="note-timestamp">{new Date(note.timestamp).toLocaleString()}</span>
                <span className="note-author">{note.createdBy}</span>
              </div>
              <div className="note-content">{note.content}</div>
            </div>
          ))}
        </div>

        <div className="new-note">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a new note..."
            rows={4}
          />
          <button 
            className="save-note-btn"
            onClick={handleSave}
            disabled={!newNote.trim()}
          >
            Add Note
          </button>
        </div>
      </div>
    );
  };

  const saveNotes = async (recordId: string) => {
    setSaveStatus({id: recordId, status: "saving"});
    
    try {
      const newNote: Note = {
        id: Date.now().toString(),
        content: notesDraft,
        timestamp: new Date().toISOString(),
        createdBy: "Nutritionist", // You might want to get this from user context
      };

      const updatedRecords = records.map(record => {
        if (record.id === recordId) {
          return {
            ...record,
            nutritionistNotes: notesDraft,
            notesHistory: [...(record.notesHistory || []), newNote],
          };
        }
        return record;
      });
      
      setRecords(updatedRecords);
      localStorage.setItem("healthRecords", JSON.stringify(updatedRecords));
      
      if (import.meta.env.VITE_USE_API === "true") {
        const recordToUpdate = records.find(r => r.id === recordId);
        if (recordToUpdate) {
          await healthRecordService.updateRecord({
            ...recordToUpdate,
            nutritionistNotes: notesDraft,
            notesHistory: [...(recordToUpdate.notesHistory || []), newNote],
          });
        }
      }
      
      setSaveStatus({id: recordId, status: "saved"});
      setTimeout(() => setSaveStatus({id: "", status: null}), 2000);
      setNotesEditing(null);
      setNotesDraft("");
    } catch (err) {
      console.error("Failed to save notes", err);
      setSaveStatus({id: recordId, status: "error"});
      setTimeout(() => setSaveStatus({id: "", status: null}), 2000);
    }
  };

  if (loading) return <div className="loading">Loading records...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="nutritionist-dashboard">
      <h2>Nutritionist Dashboard</h2>

      <input
        type="text"
        className="search-bar"
        placeholder="Search by name or mobile..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="dashboard-content">
        <div className={`records-container ${selectedPatient ? 'with-notes' : ''}`}>
          {filteredRecords.length === 0 ? (
            <p>No records match your search.</p>
          ) : (
            <table className="records-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("fullName")}>Name</th>
                  <th onClick={() => handleSort("age")}>Age</th>
                  <th>Gender</th>
                  <th>Blood Type</th>
                  <th>Purpose</th>
                  <th onClick={() => handleSort("healthCheckupDate")}>Checkup Date</th>
                  <th>Report</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr>
                      <td>{record.fullName}</td>
                      <td>{record.age}</td>
                      <td>{record.gender}</td>
                      <td>{record.bloodType}</td>
                      <td>{record.purpose}</td>
                      <td>{record.healthCheckupDate}</td>
                      <td>{record.reportName || <em>No Report</em>}</td>
                      <td>
                        <button
                          className="view-notes-btn"
                          onClick={() => setSelectedPatient(record)}
                        >
                          Share Notes
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedPatient && (
          <NotesPanel
            record={selectedPatient}
            onSave={(note) => {
              setNotesDraft(note);
              saveNotes(selectedPatient.id);
            }}
            onClose={() => setSelectedPatient(null)}
          />
        )}
      </div>
    </div>
  );
};

export default NutritionistDashboard;