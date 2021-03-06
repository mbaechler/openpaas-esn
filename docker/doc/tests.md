# Testing OpenPaaS ESN with Docker

Unit tests and integration tests are launched with Grunt (cf Gruntfile.js at the root of the repository).
They can also be launched in Docker containers with the help of the grunt-docker-spawn plugin.

The related grunt tasks are all starting with the 'docker-' prefix:

- docker-test
- docker-test-unit-storage
- ...

While the tests should work out of the box on a Linux platform locally, they need some additional parameters to run on Windows and OS X or on remote host.

```bash
DOCKER_HOST=192.168.99.100 DOCKER_PORT=2376 DOCKER_CERT_PASS=mypass grunt docker-test-modules-midway --docker remote
```

By using the *DOCKER\_* environment variables, we give grunt required environment variables to launch container on the *remote* machine.
The remote configuration is also defined in the Gruntfile under the container.options configuration:

```json
  {
    remote: {
      host: process.env.DOCKER_HOST || '192.168.99.100',
      port: process.env.DOCKER_PORT || 2376,
      ca: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/ca.pem', 'utf-8'),
      cert: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/cert.pem', 'utf-8'),
      key: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/key.pem', 'utf-8'),
      pass: process.env.DOCKER_CERT_PASS || 'mypass'
    }
  }
```

Note that you may need to generate P12 certificates on OS X (As explained here http://blog.couchbase.com/2016/february/enabling-docker-remote-api-docker-machine-mac-osx). 

On the docker-machine VM:

```bash
cd $DOCKER_CERT_PATH
```

then

```bash
openssl pkcs12 -export \
-inkey key.pem \
-in cert.pem \
-CAfile ca.pem \
-chain \
-name client-side \
-out cert.p12 \
-password pass:mypass
```

Please note that the password defined just here is the same which is used in DOCKER_CERT_PASS environment variable in the remote configuration above.

