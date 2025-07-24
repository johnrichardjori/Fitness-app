import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import Modal from "react-modal";
import { SnackbarProvider, useSnackbar } from "notistack";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./App.css";

const COLORS = ["#a855f7", "#f59e0b"];

const LOCAL_STORAGE_KEY = "healthAndFitness";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    maxWidth: "400px",
    margin: "auto",
  },
};

const AddEditForm = ({
  isOpen,
  onRequestClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customStyles}>
      <h3 style={{ textAlign: "center" }}>
        {isEdit
          ? "Let's see what you want to change!"
          : "How Much Net Calories did you take Today?"}
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <label>Calorie Intake:</label>
        <input
          type="number"
          name="caloriesIntake"
          placeholder="Enter Today's Calorie Intake"
          value={formData.caloriesIntake}
          onChange={handleChange}
          required
        />

        <label>Calorie Burned:</label>
        <input
          type="number"
          name="caloriesBurned"
          placeholder="Enter Today's Calorie Burned"
          value={formData.caloriesBurned}
          onChange={handleChange}
          required
        />

        <label>Short Description:</label>
        <input
          type="text"
          name="description"
          placeholder="Enter a short description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <button type="submit">Submit</button>
        <button className="cancel" onClick={onRequestClose} type="button">
          Cancel
        </button>
      </form>
    </Modal>
  );
};

const AppContent = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    caloriesIntake: "",
    caloriesBurned: "",
    description: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleAdd = () => {
    setFormData({
      date: "",
      caloriesIntake: "",
      caloriesBurned: "",
      description: "",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (index) => {
    setFormData(data[index]);
    setEditIndex(index);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (index) => {
    const updated = [...data];
    updated.splice(index, 1);
    setData(updated);
    enqueueSnackbar("Entry deleted!", { variant: "warning" });
  };

  const handleSubmit = () => {
    const newEntry = {
      ...formData,
      caloriesIntake: +formData.caloriesIntake,
      caloriesBurned: +formData.caloriesBurned,
    };
    if (isEditMode) {
      const updated = [...data];
      updated[editIndex] = newEntry;
      setData(updated);
      enqueueSnackbar("Entry updated!", { variant: "info" });
    } else {
      setData([...data, newEntry]);
      enqueueSnackbar("Data added successfully!", { variant: "success" });
    }
    setIsModalOpen(false);
  };

  const lastWeekData = data
    .filter((entry) => {
      const today = new Date();
      const entryDate = new Date(entry.date);
      const diff = (today - entryDate) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalIntake = data.reduce((acc, cur) => acc + cur.caloriesIntake, 0);
  const totalBurned = data.reduce((acc, cur) => acc + cur.caloriesBurned, 0);

  return (
    <div className="App">
      <h1>Health And Fitness Tracker</h1>

      <div className="top-section">
        <div className="add-card">
          <h3>Update Today's Data</h3>
          <button onClick={handleAdd}>+ Add data</button>
        </div>

        <div className="chart-section">
          {data.length > 0 && <h4>Weekly Health Trends:</h4>}
          {lastWeekData.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={lastWeekData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="caloriesIntake"
                  fill="#a855f7"
                  name="caloriesIntake"
                />
                <Bar
                  dataKey="caloriesBurned"
                  fill="#82ca9d"
                  name="caloriesBurned"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bottom-section">
        <div className="recent">
          <h4>
            <em>Recent Health Statistics.</em>
          </h4>
          {data.length === 0 ? (
            <p>No Progress to show!</p>
          ) : (
            data.map((entry, idx) => (
              <div key={idx} className="entry">
                <p>{entry.description}</p>
                <small>
                  Calories Intake = {entry.caloriesIntake} Calories Burned ={" "}
                  {entry.caloriesBurned}
                </small>
                <div className="entry-footer">
                  <span>{entry.date}</span>
                  <button onClick={() => handleEdit(idx)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(idx)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pie">
          <h4>
            <strong>Overall Data:</strong>
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: "Intake", value: totalIntake },
                  { name: "Burned", value: totalBurned },
                ]}
                dataKey="value"
                outerRadius={60}
              >
                {COLORS.map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <AddEditForm
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEdit={isEditMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={2000}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <AppContent />
    </SnackbarProvider>
  );
}
