import * as React from 'react';
import { Button, Form, Header, Icon, Table } from 'semantic-ui-react';
import utils from '../utils';

interface Item {
  name: string;
  value: string;
}

export default function UrlParser() {
  const [rawValue, setRawValue] = React.useState('');
  const [urlParts, setUrlParts] = React.useState<Item[]>([]);
  const [params, setParams] = React.useState<Item[]>([]);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setUrlParts([]);
    setParams([]);
    setSuccess(false);
    if (rawValue === '') return;
    try {
      const url = new URL(rawValue);
      const propItems: Item[] = [];
      propItems.push({ name: 'Origin', value: url.origin });
      propItems.push({ name: 'Protocol', value: url.protocol });
      propItems.push({ name: 'Host', value: url.host });
      propItems.push({ name: 'Hostname', value: url.hostname });
      propItems.push({ name: 'Port', value: url.port });
      propItems.push({ name: 'Username', value: url.username });
      propItems.push({ name: 'Password', value: url.password });
      propItems.push({ name: 'Path', value: url.pathname });
      propItems.push({ name: 'Query String', value: url.search });
      propItems.push({ name: 'Hash', value: url.hash });
      setUrlParts(propItems);
      const paramItems: Item[] = [];

      url.searchParams.entries().forEach((p) => {
        paramItems.push({ name: p[0], value: p[1] });
      });

      setParams(paramItems);
      setSuccess(true);
    } catch (error) {
      utils.toast.error('Parsing failed!');
    }
  }, [rawValue]);

  const onReset = () => {
    setRawValue('');
  };

  const onCopy = (str: string) => {
    utils.copy(str);
  };

  return (
    <>
      <Form>
        <Form.TextArea
          rows={5}
          value={rawValue}
          label="URL"
          onChange={(e) => setRawValue(e.currentTarget.value)}
          placeholder="Enter or paste url here"
        />
        <Form.Group inline>
          <Form.Button onClick={onReset}>Reset</Form.Button>
        </Form.Group>
      </Form>
      <div
        style={{ marginTop: 25, display: success === false ? 'none' : 'block' }}
      >
        <Header as="h3">URL Parts</Header>
        <Table stackable>
          <Table.Body>
            {urlParts.map((p) => (
              <Table.Row key={p.name}>
                <Table.Cell collapsing>
                  <strong>{p.name}</strong>
                </Table.Cell>
                <Table.Cell>{p.value}</Table.Cell>
                <Table.Cell textAlign="right">
                  {p.value !== '' && (
                    <Button icon size="mini" onClick={() => onCopy(p.value)}>
                      <Icon name="copy" />
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Header as="h3">Query String</Header>
        <Table stackable>
          <Table.Body>
            {params.map((p, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <Table.Row key={idx}>
                <Table.Cell collapsing>
                  <strong>{p.name}</strong>
                </Table.Cell>{' '}
                <Table.Cell>{p.value}</Table.Cell>
                <Table.Cell textAlign="right">
                  {p.value !== '' && (
                    <Button icon size="mini" onClick={() => onCopy(p.value)}>
                      <Icon name="copy" />
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </>
  );
}
