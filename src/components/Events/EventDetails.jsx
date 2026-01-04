import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import Header from '../Header.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['event', params.id], // unique key for this specific event
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    staleTime: 60000, // cache for 1 minute
  });

  const { 
    mutate, 
    isPending: isPendingDeletion, 
    isError: isErrorDeleting, 
    error: deleteError 
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      // Invalidate the 'events' query to refetch the list after deletion
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' }); // refetchType 'none' to avoid immediate refetch
      navigate('/events');
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: params.id }); // call the mutation to delete the event
  } 

  let content;

  if (isPending) {
    content = <div id="event-details-content" className='center'>
      <p>Fetching event details...</p>
    </div>;
  }

  if (isError) {
    content = <div id="event-details-content" className='center'>
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch event details.'} />
    </div>;
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt="" />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  } 

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This process cannot be undone.
          </p>
          {isPendingDeletion && <p>Deleting event...</p>}
          {!isPendingDeletion && (
            <>
              <button onClick={handleDelete} className="button-text">
                Delete
              </button>
              <button onClick={handleStopDelete} className="button">
                Cancel
              </button>
            </>
          )}

          {isErrorDeleting && (
            <ErrorBlock title="Failed to delete event" message={deleteError.info?.message || 'Failed to delete event, please try again.'} />
          )}
          
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
