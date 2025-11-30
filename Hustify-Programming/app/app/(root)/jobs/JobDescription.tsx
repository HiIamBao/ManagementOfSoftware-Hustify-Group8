import Link from "next/link";

const JobDescription = ({ job }: JobDescriptionProps) => {
  if (!job) {
    return <div className="text-gray-400">Select a job to see details.</div>;
  }

  return (
    <div className="p-4 border rounded-lg shadow">
      <Link href={`/jobs/${job.id}`}>
        <h2 className="text-2xl font-bold mb-2 hover:text-primary-600 hover:underline cursor-pointer">
          {job.title}
        </h2>
      </Link>
      <div className="text-gray-600 mb-2">{job.location}</div>
      <p className="mb-4">{job.description}</p>
      <h3 className="font-semibold mb-1">Requirements:</h3>
      <ul className="list-disc ml-5">
        {job.requirements.map((req, idx) => (
          <li key={idx}>{req}</li>
        ))}
      </ul>

      <div className="mt-4">
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm text-primary-600 hover:underline"
        >
          View full details
        </Link>
      </div>
    </div>
  );
};

export default JobDescription;
