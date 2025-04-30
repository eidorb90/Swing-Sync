import * as React from 'react';
// Remove the separate import for useState since it's already in React
import { DataGrid } from '@mui/x-data-grid';
import { columns, rows } from './gridData';

export default function CustomizedDataGrid() {
  // Use React.useState instead of just useState
  const [gridRows, setGridRows] = React.useState(rows);
  const [loading, setLoading] = React.useState(true);

  async function fetchAndUpdateRows() {
    try {
      const leaderboardData = await fetchUserData();
      // Assuming leaderboardData is an array of users
      const formattedData = leaderboardData.map((user, index) => ({
        id: (index + 2).toString(), // Start from id 2 since we already have id 1
        user: user.username || user.name || "Unknown User",
        status: 'Online', 
        handicap: user.handicap || 0,
        totalRounds: user.total_rounds || 0,
        averageScore: user.average_score || 0,
      }));
      
      // Return the combined array with the static entry and the fetched data
      return [...rows, ...formattedData];
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      return rows; // Return just the static data if fetch fails
    }
  }

  async function fetchUserData() {
    try {
      const user_id = localStorage.getItem('userId');
      // Add credentials and mode to the fetch request
      const response = await fetch(`http://localhost:8000/api/leaderboard/`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Network request failed:", error.message);
      // Throw the error to be caught by fetchAndUpdateRows
      throw error;
    }
  }

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const updatedRows = await fetchAndUpdateRows();
        setGridRows(updatedRows);
      } catch (error) {
        console.error("Error loading grid data:", error);
        // Still set loading to false even if there's an error
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DataGrid
      loading={loading} // Add the loading prop to show loading state
      checkboxSelection
      rows={gridRows} // Use gridRows instead of rows
      columns={columns}
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      initialState={{
        pagination: { paginationModel: { pageSize: 40 } },
      }}
      pageSizeOptions={[40]}
      disableColumnResize
      density="compact"
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: 'outlined',
              size: 'small',
            },
            columnInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            operatorInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: 'outlined',
                size: 'small',
              },
            },
          },
        },
      }}
    />
  );
}