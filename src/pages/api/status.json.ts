import http from 'http';

interface ContainerInfo {
  Id: string;
  Names: string[];
  State: string;
}

interface DockerStatus {
  [containerName: string]: string;
}

function queryDocker(path: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const options = {
      socketPath: '/var/run/docker.sock',
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

export async function GET() {
  try {
    const result = await queryDocker('/v1.41/containers/json?all=true');

    if (!Array.isArray(result)) {
      throw new Error('Docker API did not return array of containers');
    }

    const containers = result as ContainerInfo[];
    const status: DockerStatus = {};

    containers.forEach((container) => {
      const name = container.Names[0]?.replace(/^\//, '') || container.Id.slice(0, 12);
      status[name] = container.State;
    });

    return new Response(JSON.stringify(status), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error querying Docker:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to query Docker daemon', details: String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
